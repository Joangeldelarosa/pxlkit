import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { v4 as uuidv4 } from 'uuid';
import { kv } from '@vercel/kv';

const resend = new Resend(process.env.RESEND_API_KEY || 're_test123');
const CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const APP_SECRET = process.env.PAYPAL_SECRET;

// To support sandbox vs live, use the correct endpoint
const base = process.env.NODE_ENV === 'production' && !CLIENT_ID?.startsWith('sb-')
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

/**
 * Generate an OAuth 2.0 access token for authenticating with PayPal REST APIs.
 */
async function generateAccessToken() {
  if (!CLIENT_ID || !APP_SECRET) {
    throw new Error('MISSING_API_CREDENTIALS');
  }
  const auth = Buffer.from(`${CLIENT_ID}:${APP_SECRET}`).toString('base64');
  const response = await fetch(`${base}/v1/oauth2/token`, {
    method: 'POST',
    body: 'grant_type=client_credentials',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error_description || 'Failed to generate access token');
  }
  return data.access_token;
}

/**
 * Capture payment for the created order to complete the transaction.
 */
async function captureOrder(orderID: string) {
  const accessToken = await generateAccessToken();
  const url = `${base}/v2/checkout/orders/${orderID}/capture`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to capture order');
  }
  return data;
}

export async function POST(request: Request) {
  try {
    const { orderID, planName = 'Commercial', buyerData } = await request.json();

    if (!orderID) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    let buyerEmail = buyerData?.email || 'customer@example.com';
    let buyerName = buyerData?.name || 'Developer';
    const projectName = buyerData?.projectName || 'N/A';
    
    // DEV MODE OVERRIDE: Si estamos en local y forzamos el ID 'DEV_ORDER_ID' simularemos el éxito
    if (process.env.NODE_ENV === 'development' && orderID === 'DEV_ORDER_ID') {
      console.log('⚡ SIMULANDO PAGO EXITOSO EN DEV MODE');
    } else {
      // PRODUCCION / SANDBOX REAL
      if (!CLIENT_ID || !APP_SECRET || CLIENT_ID === 'test') {
         return NextResponse.json({ error: 'PayPal credentials missing. Use DEV_ORDER_ID to simulate locally.' }, { status: 500 });
      }

      const captureData = await captureOrder(orderID);
      const captureStatus = captureData?.status;
      
      if (captureStatus !== 'COMPLETED') {
        return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
      }

      // Extract buyer info
      const payer = captureData?.payer;
      buyerEmail = payer?.email_address || buyerEmail;
      buyerName = payer?.name?.given_name || buyerName;
    }

    // 2. Generar licencia única
    const uniqueId = uuidv4().substring(0, 8).toUpperCase();
    const licenseKey = `PXL-${uniqueId}`;

    // 3. Almacenar licencia de forma rápida, segura y simple en Vercel KV (Redis)
    // Key: "license:PXL-XXXXXX"
    // Value: { email, plan, date }
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      await kv.set(`license:${licenseKey}`, { 
        email: buyerEmail, 
        name: buyerName,
        project: projectName,
        plan: planName, 
        createdAt: new Date().toISOString(),
        orderID
      });
      console.log(`✅ Licencia ${licenseKey} guardada en KV para ${buyerEmail} (Proyecto: ${projectName})`);
    } else {
      console.warn('⚠️ No hay Vercel KV configurado. La licencia solo se envió al usuario y no se guardó.');
    }

    // 4. Send email via Resend
    // ATENCIÓN: Si usas la versión GRAUITA de Resend, solo puedes enviar correos al EMAIL CON EL QUE CREASTE LA CUENTA (ej. info@pxlkit.xyz).
    // Para enviar a los correos reales de los clientes (buyerEmail), debes agregar un DOMINIO VERIFICADO en Resend (ej. pxlkit.xyz).
    if (process.env.RESEND_API_KEY) {
      // Si estamos en desarrollo, forzamos tu correo de pruebas para que funcione sin dominio verificado. En prod usar buyerEmail.
      const toEmail = process.env.NODE_ENV === 'development' ? 'info@pxlkit.xyz' : buyerEmail;

      const { data, error } = await resend.emails.send({
        // Resend solo deja enviar desde onboarding@resend.dev en cuentas gratis o un correo de tu dominio verificado.
        from: 'Pxlkit <licenses@pxlkit.xyz>', // Cámbialo a licencias@tudominio.com cuando tengas el dominio
        to: toEmail,
        subject: `Your Pxlkit ${planName} License`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h1 style="color: #22c55e;">Thank you for your purchase, ${buyerName}!</h1>
            <p>Your purchase of the <strong>${planName} License</strong> was processed successfully.</p>
            <p><strong>Project Name:</strong> ${projectName}</p>
            <p>Here is your unique license key:</p>
            <div style="background-color: #f4f4f5; padding: 20px; border-radius: 8px; font-family: monospace; font-size: 24px; text-align: center; letter-spacing: 2px; margin: 24px 0;">
              <strong>${licenseKey}</strong>
            </div>
            <p>Please keep this email and your license key safe as proof of your commercial rights to use the Pxlkit icons.</p>
            <p>If you have any questions, feel free to reply to this email.</p>
            <div style="margin-top: 30px; text-align: center;">
              <a href="https://pxlkit.xyz/docs" style="background-color: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Get Started</a>
            </div>
            <hr style="border: none; border-top: 1px solid #eaeaea; margin: 40px 0;" />
            <p style="font-size: 12px; color: #666; text-align: center;">
              Pxlkit - https://pxlkit.xyz
            </p>
          </div>
        `
      });
      
      if (error) {
        console.error('⚠️ Error desde Resend:', error);
      } else {
        console.log(`✉️ Email de licencia intentó enviarse a ${toEmail} (ID: ${data?.id})`);
      }
    } else {
      console.warn('⚠️ No RESEND_API_KEY configurada. El correo simuló enviarse pero no salió de la máquina.');
    }

    return NextResponse.json({ success: true, license: licenseKey });
  } catch (error: unknown) {
    console.error('PayPal Capture Error:', error);
    const msg = error instanceof Error ? error.message : 'An error occurred during capture';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
