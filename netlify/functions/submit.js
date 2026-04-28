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
          from: { name: "iPODO expert lab", email: "info@ipodoexpertlab.com" },
          to: [{ name, email }],
          text: `Здравствуйте, ${name}!\n\nВаша заявка на офф-лайн семинар iPODO expert lab принята.\n\nВыбранный поток: ${stream}\n${phone ? `Телефон: ${phone}\n` : ""}Менеджер свяжется с Вами в ближайшее время.\n\nС уважением,\nКоманда iPODO expert lab\n+382-67-417-580\nipodoexpertlab.com`,
          html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#222;font-size:15px;line-height:1.6">
            <p>Здравствуйте, ${name}!</p>
            <p>Ваша заявка на офф-лайн семинар <strong>iPODO expert lab</strong> принята.</p>
            <p><strong>Выбранный поток:</strong> ${stream}</p>
            ${phone ? `<p><strong>Телефон:</strong> ${phone}</p>` : ""}
            <p>Менеджер свяжется с Вами в ближайшее время.</p>
            <p>С уважением,<br>Команда iPODO expert lab<br>+382-67-417-580<br>ipodoexpertlab.com</p>
          </div>`,
        },
      }),
    });
    const clientEmailData = await clientEmailRes.json();
    console.log("Client email response:", JSON.stringify(clientEmailData));

    // Email to admin (Zoho)
    const adminEmailRes = await fetch("https://api.sendpulse.com/smtp/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify({
        email: {
          subject: `Новая заявка: ${name} · ${stream}`,
          from: { name: "iPODO expert lab", email: "info@ipodoexpertlab.com" },
          to: [{ name: "Admin", email: "info@ipodoexpertlab.com" }],
          text: `Новая заявка на офф-лайн семинар\n\nИмя: ${name}\nEmail: ${email}\nТелефон: ${phone || "—"}\nПоток: ${stream}`,
          html: `<div style="font-family:Arial,sans-serif;max-width:480px;font-size:14px;color:#222">
            <h2 style="font-size:18px;margin-bottom:16px">Новая заявка на офф-лайн семинар</h2>
            <p><strong>Имя:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Телефон:</strong> ${phone || "—"}</p>
            <p><strong>Поток:</strong> ${stream}</p>
          </div>`,
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