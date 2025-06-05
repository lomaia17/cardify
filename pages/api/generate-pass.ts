import fs from 'fs';
import path from 'path';
import { bucket, db } from '../../utils/firebaseAdmin'; // db should be from firebase-admin
import { NextApiRequest, NextApiResponse } from 'next';
import { Firestore } from 'firebase-admin/firestore';

const PKPass = require('passkit-generator');

async function getPemBuffer(filename: string): Promise<Buffer> {
  const file = bucket.file(`certificates/${filename}`);
  const [exists] = await file.exists();
  if (!exists) {
    throw new Error(`File not found in Firebase Storage: certificates/${filename}`);
  }
  const [contents] = await file.download();
  return contents;
}
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { cardId } = req.query;

  if (!cardId || Array.isArray(cardId)) {
    return res.status(400).json({ error: 'cardId is required and must be a string' });
  }

  try {
    // ✅ Use Admin SDK's collection().doc().get()
    const cardRef = db.collection('cards').doc(cardId as string);
    const cardDoc = await cardRef.get();

    if (!cardDoc.exists) {
      return res.status(404).json({ error: 'Card not found' });
    }

    const cardData = cardDoc.data();

    // Validate required fields
    if (!cardData?.firstName || !cardData?.lastName || !cardData?.title) {
      return res.status(400).json({ error: 'Missing required card fields' });
    }

    // Load certs from Firebase Storage
    const signerCert = await getPemBuffer('passwallet.pem');
    const signerKey = await getPemBuffer('pass-key.pem');
    const wwdr = await getPemBuffer('wwdr.pem');

    // Determine pass template path
    const templateName = cardData.template || 'businessCard.pass';
    const passModelPath = path.join(process.cwd(), 'passModels', templateName);

    const pass = await PKPass.from({
      model: passModelPath,
      certificates: {
        signerCert,
        signerKey,
        wwdr,
        signerKeyPassphrase: process.env.CERT_PASSWORD || 'your_certificate_password',
      },
    });

    // Add fields
    pass.primaryFields.push({
      key: 'name',
      label: 'Name',
      value: `${cardData.firstName} ${cardData.lastName}`,
    });

    pass.secondaryFields.push({
      key: 'title',
      label: 'Title',
      value: cardData.title || 'Not Provided',
    });

    pass.auxiliaryFields.push(
      {
        key: 'email',
        label: 'Email',
        value: cardData.email || 'example@example.com',
      },
      {
        key: 'phone',
        label: 'Phone',
        value: cardData.phone || 'Not Provided',
      }
    );

    if (cardData.linkedin) {
      pass.backFields.push({
        key: 'linkedin',
        label: 'LinkedIn',
        value: cardData.linkedin,
      });
    }

    pass.setBarcodes({
      message: `https://yourdomain.com/card/${cardId}`,
      format: 'PKBarcodeFormatQR',
      messageEncoding: 'iso-8859-1',
      altText: 'Scan to view the business card',
    });

    const pkpassBuffer = await pass.getAsBuffer();

    res.setHeader('Content-Type', 'application/vnd.apple.pkpass');
    res.setHeader('Content-Disposition', 'attachment; filename=businessCard.pkpass');
    res.status(200).send(pkpassBuffer);
  } catch (error: any) {
    console.error('Error generating pass:', error);
    res.status(500).json({ error: 'Failed to generate pass', details: error.message });
  }
}
