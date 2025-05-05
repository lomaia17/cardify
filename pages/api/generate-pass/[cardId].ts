import fs from 'fs';
import path from 'path';
import { PKPass } from 'passkit-generator';
import { db, doc, getDoc } from '../../../utils/firebaseConfig';
import { NextApiRequest, NextApiResponse } from 'next'; // Import Next.js types

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { cardId } = req.query;

  if (!cardId) {
    return res.status(400).json({ error: 'cardId is required' });
  }

  try {
    // Fetch Firestore data
    const cardRef = doc(db, 'cards', cardId as string);
    const cardDoc = await getDoc(cardRef);

    if (!cardDoc.exists()) {
      return res.status(404).json({ error: 'Card not found' });
    }

    const cardData = cardDoc.data();

    // Paths
    const certsPath = path.join(process.cwd(), 'certs');
    const passModelPath = path.join(process.cwd(), 'passModels', 'businessCard.pass');

    // Initialize pass from the pass template and certificates
    const pass = await PKPass.from({
      model: passModelPath,
      certificates: {
        signerCert: fs.readFileSync(path.join(certsPath, 'passwallet.pem')),
        signerKey: fs.readFileSync(path.join(certsPath, 'pass-key.pem')),
        wwdr: fs.readFileSync(path.join(certsPath, 'wwdr.pem')),
        signerKeyPassphrase: process.env.CERT_PASSWORD || 'your_certificate_password',
      },
    });

    // === FIELDS ===
    // Primary Field: Name + Title
    pass.primaryFields.push({
      key: 'nameTitle',
      label: 'Name / Title',
      value: `${cardData.firstName} ${cardData.lastName} / ${cardData.title}`,
    });

    // Secondary Fields: Company & Email
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

    // Auxiliary Fields: Phone
    pass.auxiliaryFields.push({
      key: 'phone',
      label: 'Phone',
      value: cardData.phone || 'Not provided',
    });

    // Back Fields (optional): LinkedIn
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
      altText: "Scan to view the business card"
    });

    // === GENERATE PASS ===
    const pkpassBuffer = await pass.getAsBuffer();

    // Set headers
    res.setHeader('Content-Type', 'application/vnd.apple.pkpass');
    res.setHeader('Content-Disposition', 'attachment; filename=businessCard.pkpass');

    // Send .pkpass file
    return res.status(200).send(pkpassBuffer);
  } catch (error) {
    console.error('Error generating business card pass:', error);
    res.status(500).json({ error: 'Failed to generate pass' });
  }
}
