import fs from 'fs';
import path from 'path';
import { PKPass } from 'passkit-generator';
import { db, collection, query, where, getDocs } from '../../../utils/firebaseConfig';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Request received:', req.method);

  // Ensure the request is a POST request
  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Access the slug (cardId) from the dynamic route parameter
  const { cardId } = req.query;  // Get the cardId (slug) from the dynamic route
  console.log('Received cardId:', cardId);

  if (!cardId || Array.isArray(cardId)) {
    console.log('Missing cardId in request or cardId is an array');
    return res.status(400).json({ error: 'cardId is required' });
  }

  try {
    // Fetch Firestore data using the cardId (slug)
    console.log('Querying Firestore for card with cardId:', cardId);
    const q = query(collection(db, "cards"), where("slug", "==", cardId));  // Query by slug
    const querySnapshot = await getDocs(q);

    // Check if the card was found
    if (querySnapshot.empty) {
      console.error('Card not found for cardId:', cardId);
      return res.status(404).json({ error: 'Card not found' });
    }

    const cardData = querySnapshot.docs[0].data();
    console.log('Fetched card data:', cardData);

    // Paths for certificates and model
    const certsPath = path.join(process.cwd(), 'certs');
    const passModelPath = path.join(process.cwd(), 'passModels', 'businessCard.pass');
    console.log('Certificate paths:', certsPath);

    // Initialize pass from the pass template and certificates
    console.log('Initializing PKPass...');
    const pass = await PKPass.from({
      model: passModelPath,
      certificates: {
        signerCert: fs.readFileSync(path.join(certsPath, 'passwallet.pem')),
        signerKey: fs.readFileSync(path.join(certsPath, 'pass-key.pem')),
        wwdr: fs.readFileSync(path.join(certsPath, 'wwdr.pem')),
        signerKeyPassphrase: process.env.CERT_PASSWORD || 'Ekakitia2002',
      },
    });
    console.log('PKPass initialized successfully');

    // === FIELDS ===
    console.log('Adding fields to pass...');
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
      altText: "Scan to view the business card"
    });
    console.log('Fields and barcode added to pass');

    // === GENERATE PASS ===
    console.log('Generating .pkpass file...');
    const pkpassBuffer = await pass.getAsBuffer();
    console.log('Pass generated successfully');

    // Set headers and send the .pkpass file
    res.setHeader('Content-Type', 'application/vnd.apple.pkpass');
    res.setHeader('Content-Disposition', 'attachment; filename=businessCard.pkpass');

    // Send .pkpass file
    return res.status(200).send(pkpassBuffer);
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error generating business card pass:', err);
    res.status(500).json({ error: 'Failed to generate pass', details: err.message });
  }
}
