import path from 'path';
import { PKPass } from 'passkit-generator';
import { db, collection, query, where, getDocs } from '../../../utils/firebaseConfig';
import { bucket } from '../../../utils/firebaseAdmin';
import { NextApiRequest, NextApiResponse } from 'next';

// Helper to load PEM files from Firebase Storage
async function getPemBuffer(filename: string): Promise<Buffer> {
  const file = bucket.file(`certificates/${filename}`);
  const [contents] = await file.download();
  return contents;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Request received:', req.method);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { cardId } = req.query;
  if (!cardId || Array.isArray(cardId)) {
    return res.status(400).json({ error: 'cardId is required and must be a string' });
  }

  try {
    // Get card from Firestore
    const q = query(collection(db, "cards"), where("slug", "==", cardId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return res.status(404).json({ error: 'Card not found' });
    }

    const cardData = snapshot.docs[0].data();

    if (!cardData.firstName || !cardData.lastName || !cardData.title) {
      return res.status(400).json({ error: 'Missing required card fields' });
    }

    const templateName = cardData.template || 'businessCard.pass';
    const passModelPath = path.join(process.cwd(), 'passModels', templateName);

    // Load certificates from Firebase Storage
    const signerCert = await getPemBuffer('passwallet.pem');
    const signerKey = await getPemBuffer('pass-key.pem');
    const wwdr = await getPemBuffer('wwdr.pem');

    const pass = await PKPass.from({
      model: passModelPath,
      certificates: {
        signerCert,
        signerKey,
        wwdr,
        signerKeyPassphrase: process.env.CERT_PASSWORD || 'Ekakitia2002',
      },
    });

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

    if (cardData.linkedin) {
      pass.backFields.push({
        key: 'linkedin',
        label: 'LinkedIn',
        value: cardData.linkedin,
      });
    }

    pass.setBarcodes({
      message: `https://yourdomain.com/card/${cardId}`,
      format: "PKBarcodeFormatQR",
      messageEncoding: "iso-8859-1",
      altText: "Scan to view the business card",
    });

    const pkpassBuffer = await pass.getAsBuffer();

    res.setHeader('Content-Type', 'application/vnd.apple.pkpass');
    res.setHeader('Content-Disposition', 'attachment; filename=businessCard.pkpass');
    return res.status(200).send(pkpassBuffer);
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error generating pass:', err);
    res.status(500).json({ error: 'Failed to generate pass', details: err.message });
  }
}
