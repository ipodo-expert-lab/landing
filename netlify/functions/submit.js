exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { name, email, phone, stream } = JSON.parse(event.body);

    const tokenRes = await fetch(
      "https://api.sendpulse.com/oauth/access_token",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grant_type: "client_credentials",
          client_id: process.env.SP_CLIENT_ID,
          client_secret: process.env.SP_CLIENT_SECRET,
        }),
      },
    );
    const tokenData = await tokenRes.json();
    const access_token = tokenData.access_token;
    console.log("Token received:", access_token ? "YES" : "NO");
    if (!access_token) {
      console.error("Token error:", JSON.stringify(tokenData));
      return { statusCode: 500, body: JSON.stringify({ error: "No token" }) };
    }

    // CRM contact
    const crmRes = await fetch("https://api.sendpulse.com/crm/v1/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify({ name, email, phone, description: stream }),
    });
    const crmData = await crmRes.json();
    console.log("CRM response:", JSON.stringify(crmData));

    // Email to client
    const clientEmailRes = await fetch("https://api.sendpulse.com/smtp/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify({
        email: {
          subject: "Ваша заявка принята — iPODO expert lab",
          html: `<div style="font-family:'Helvetica Neue',sans-serif;max-width:560px;margin:0 auto">
            <div style="background:#0D0F14;padding:20px 28px;border-radius:12px 12px 0 0">
              <span style="background:#6B8CFF;color:#fff;font-weight:700;padding:3px 10px;border-radius:6px;font-size:12px">iPODO</span>
              <span style="color:#fff;font-size:15px;font-weight:600;margin-left:8px">expert lab</span>
            </div>
            <div style="background:#f5f5f5;padding:28px;border-radius:0 0 12px 12px">
              <h2 style="margin:0 0 12px;font-size:20px">Ваша заявка принята, ${name}!</h2>
              <p style="color:#555;line-height:1.7;margin-bottom:20px">Менеджер свяжется с вами в течение <strong>15 минут</strong>.</p>
              <div style="background:#fff;border-radius:10px;padding:18px;margin-bottom:20px;border-left:4px solid #6B8CFF">
                <p style="margin:0 0 4px;font-size:11px;color:#888;font-weight:700;text-transform:uppercase">Ваш выбор</p>
                <p style="margin:0;font-size:16px;font-weight:700">${stream}</p>
                ${phone ? `<p style="margin:6px 0 0;font-size:13px;color:#555">Телефон: ${phone}</p>` : ""}
              </div>
              <a href="viber://chat?number=38267417580" style="display:inline-block;background:#7360f2;color:#fff;padding:11px 22px;border-radius:8px;text-decoration:none;font-weight:700;margin-right:8px">Viber</a>
              <a href="https://t.me/ipodoexpertlab" style="display:inline-block;background:#229ed9;color:#fff;padding:11px 22px;border-radius:8px;text-decoration:none;font-weight:700">Telegram</a>
              <hr style="border:none;border-top:1px solid #e5e5e5;margin:24px 0">
              <p style="color:#aaa;font-size:11px;margin:0">iPODO expert lab · Budva, Montenegro · +382 67 417 580</p>
            </div>
          </div>`,
          from: { name: "iPODO expert lab", email: "info@ipodoexpertlab.com" },
          to: [{ name, email }],
        },
      }),
    });
    const clientEmailData = await clientEmailRes.json();
    console.log("Client email response:", JSON.stringify(clientEmailData));

    // Email to admin
    const adminEmailRes = await fetch("https://api.sendpulse.com/smtp/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify({
        email: {
          subject: `Новая заявка: ${name} · ${stream}`,
          html: `<div style="font-family:sans-serif;max-width:480px">
            <h2 style="color:#0D0F14">Новая заявка на семинар</h2>
            <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:16px">
              <tr><td style="padding:10px;border-bottom:1px solid #eee;color:#888;width:100px">Имя</td><td style="padding:10px;border-bottom:1px solid #eee;font-weight:600">${name}</td></tr>
              <tr><td style="padding:10px;border-bottom:1px solid #eee;color:#888">Email</td><td style="padding:10px;border-bottom:1px solid #eee">${email}</td></tr>
              <tr><td style="padding:10px;border-bottom:1px solid #eee;color:#888">Телефон</td><td style="padding:10px;border-bottom:1px solid #eee">${phone || "—"}</td></tr>
              <tr><td style="padding:10px;color:#888">Поток</td><td style="padding:10px;font-weight:700;color:#6B8CFF">${stream}</td></tr>
            </table>
          </div>`,
          from: { name: "iPODO expert lab", email: "info@ipodoexpertlab.com" },
          to: [{ name: "Admin", email: "ipodoexpert@gmail.com" }],
        },
      }),
    });
    const adminEmailData = await adminEmailRes.json();
    console.log("Admin email response:", JSON.stringify(adminEmailData));

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error("Function error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
