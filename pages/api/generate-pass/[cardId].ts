import path from 'path';
import { PKPass } from 'passkit-generator';
import { db, collection, query, where, getDocs } from '../../../utils/firebaseConfig';
import { bucket } from '../../../utils/firebaseAdmin';
import type { NextApiRequest, NextApiResponse } from 'next';

// Helper to load PEM files from Firebase Storage
async function getPemBuffer(filename: string) {
  const file = bucket.file(`certificates/${filename}`);
  const [exists] = await file.exists();
  if (!exists) {
    throw new Error(`File not found in Firebase Storage: certificates/${filename}`);
  }
  const [contents] = await file.download();
  return contents;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('📥 Request received:', req.method, req.url);

  if (req.method !== 'POST') {
    console.warn('❌ Invalid method:', req.method);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { cardId } = req.query;
  if (!cardId || Array.isArray(cardId)) {
    console.warn('❌ Invalid or missing cardId:', cardId);
    return res.status(400).json({ error: 'cardId is required and must be a string' });
  }

  try {
    console.log(`🔍 Searching for card with slug: ${cardId}`);
    const q = query(collection(db, 'cards'), where('slug', '==', cardId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.warn('❌ Card not found for slug:', cardId);
      return res.status(404).json({ error: 'Card not found' });
    }

    const cardDoc = snapshot.docs[0];
    const cardData = cardDoc.data();

    console.log('✅ Card data retrieved:', cardData);

    // Validate required fields explicitly
    if (
      typeof cardData.firstName !== 'string' ||
      typeof cardData.lastName !== 'string' ||
      typeof cardData.title !== 'string'
    ) {
      console.warn('❌ Missing required card fields');
      return res.status(400).json({ error: 'Missing required card fields' });
    }

    const templateName = cardData.template || 'businessCard.pass';
    const passModelPath = path.join(process.cwd(), 'passModels', templateName);
    console.log('📁 Using pass model:', passModelPath);

    // Load certificates from Firebase Storage
    console.log('🔐 Loading certificates...');
    const [signerCert, signerKey, wwdr] = await Promise.all([
      getPemBuffer('passwallet.pem'),
      getPemBuffer('pass-key.pem'),
      getPemBuffer('wwdr.pem'),
    ]);

    // Use the environment variable or default passphrase
    const signerKeyPassphrase = process.env.CERT_PASSWORD || 'Ekakitia2002';

    console.log('🛠️ Generating pass...');
    const pass = await PKPass.from({
      model: passModelPath,
      certificates: {
        signerCert,
        signerKey,
        wwdr,
        signerKeyPassphrase,
      },
    });

    console.log('✨ Adding fields to pass...');
    pass.primaryFields.push({
      key: 'nameTitle',
      label: 'Name / Title',
      value: `${cardData.firstName} ${cardData.lastName} / ${cardData.title}`,
    });

    pass.secondaryFields.push(
      {
        key: 'company',
        label: 'Company',
        value: cardData.company || 'Not provided',
      },
      {
        key: 'email',
        label: 'Email',
        value: cardData.email || 'Not provided',
      }
    );

    pass.auxiliaryFields.push({
      key: 'phone',
      label: 'Phone',
      value: cardData.phone || 'Not provided',
    });

    if (cardData.linkedin && typeof cardData.linkedin === 'string') {
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

    console.log('📦 Generating PKPass buffer...');
    const pkpassBuffer = await pass.getAsBuffer();

    res.setHeader('Content-Type', 'application/vnd.apple.pkpass');
    res.setHeader('Content-Disposition', 'attachment; filename=businessCard.pkpass');

    console.log('✅ Sending pass...');
    return res.status(200).send(pkpassBuffer);
  } catch (error) {
    console.error('🔥 Error generating pass:', error);
    return res.status(500).json({ error: 'Failed to generate pass', details: (error as Error).message });
  }
}
