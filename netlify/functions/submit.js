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

    // Email to client — шаблон SendPulse #87677
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
          template: {
            id: 87684,
            variables: {
              name: name,
              email: email,
              phone: phone || "—",
              stream: stream,
            },
          },
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