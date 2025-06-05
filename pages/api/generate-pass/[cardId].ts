import path from 'path';
import { PKPass } from 'passkit-generator';
import { db, collection, query, where, getDocs } from '../../../utils/firebaseConfig';
import { bucket } from '../../../utils/firebaseAdmin';
import type { NextApiRequest, NextApiResponse } from 'next';

// Load certificate files from Firebase Storage
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
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { cardId } = req.query;

  if (!cardId || Array.isArray(cardId)) {
    return res.status(400).json({ error: 'Invalid cardId' });
  }

  try {
    // Query Firestore by slug
    const q = query(collection(db, 'cards'), where('slug', '==', cardId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return res.status(404).json({ error: 'Card not found' });
    }

    const cardData = snapshot.docs[0].data();

    if (!cardData.firstName || !cardData.lastName || !cardData.title) {
      return res.status(400).json({ error: 'Missing required card fields' });
    }

    // Load template
    const templateName = cardData.template || 'businessCard.pass';
    const passModelPath = path.join(process.cwd(), 'passModels', templateName);

    // Load certificates
    const [signerCert, signerKey, wwdr] = await Promise.all([
      getPemBuffer('passwallet.pem'),
      getPemBuffer('pass-key.pem'),
      getPemBuffer('wwdr.pem'),
    ]);

    const signerKeyPassphrase = process.env.CERT_PASSWORD || 'Ekakitia2002';

    // Generate pass
    const pass = await PKPass.from({
      model: passModelPath,
      certificates: {
        signerCert,
        signerKey,
        wwdr,
        signerKeyPassphrase,
      },
    });

    // Fill pass fields
    pass.primaryFields.push({
      key: 'name',
      label: 'Name / Title',
      value: `${cardData.firstName} ${cardData.lastName} / ${cardData.title}`,
    });

    pass.secondaryFields.push({
      key: 'company',
      label: 'Company',
      value: cardData.company || 'Not provided',
    });

    pass.auxiliaryFields.push({
      key: 'phone',
      label: 'Phone',
      value: cardData.phone || 'Not provided',
    });

    if (cardData.email) {
      pass.auxiliaryFields.push({
        key: 'email',
        label: 'Email',
        value: cardData.email,
      });
    }

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
    console.error('Error generating pkpass:', error);
    res.status(500).json({ error: 'Failed to generate pass', message: error.message });
  }
}
