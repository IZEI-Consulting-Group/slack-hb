const { App } = require('@slack/bolt');
const axios = require('axios');
require('dotenv').config();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

app.command('/registrarproyecto', async ({ ack, body, client }) => {
  await ack();

  try {
    await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        type: 'modal',
        callback_id: 'lead_submit',
        title: { type: 'plain_text', text: 'Crear Lead' },
        submit: { type: 'plain_text', text: 'Crear' },
        close: { type: 'plain_text', text: 'Cancelar' },
        blocks: [
          {
            type: 'input',
            block_id: 'first_name',
            label: { type: 'plain_text', text: 'First Name' },
            element: {
              type: 'plain_text_input',
              action_id: 'value'
            }
          },
          {
            type: 'input',
            block_id: 'last_name',
            label: { type: 'plain_text', text: 'Last Name' },
            element: {
              type: 'plain_text_input',
              action_id: 'value'
            }
          },
          {
            type: 'input',
            block_id: 'company',
            label: { type: 'plain_text', text: 'Company' },
            element: {
              type: 'plain_text_input',
              action_id: 'value'
            }
          },
          {
            type: 'input',
            block_id: 'email',
            label: { type: 'plain_text', text: 'Email' },
            element: {
              type: 'plain_text_input',
              action_id: 'value'
            }
          },
          {
            type: 'input',
            block_id: 'phone',
            label: { type: 'plain_text', text: 'Phone' },
            element: {
              type: 'plain_text_input',
              action_id: 'value'
            }
          }
        ]
      }
    });
  } catch (error) {
    console.error('❌ Error al abrir el modal:', error);
  }
});

app.view('lead_submit', async ({ ack, view, body, client }) => {
  await ack();

  const values = view.state.values;
  const firstName = values.first_name.value.value;
  const lastName = values.last_name.value.value;
  const company = values.company.value.value;
  const email = values.email.value.value;
  const phone = values.phone.value.value;
  const user = body.user.id;

  try {
    const response = await axios.post(
      `${process.env.SALESFORCE_INSTANCE_URL}/services/data/v60.0/sobjects/Lead/`,
      {
        FirstName: firstName,
        LastName: lastName,
        Company: company,
        Email: email,
        Phone: phone,
        LeadSource: 'SlackBot'
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.SALESFORCE_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    await client.chat.postMessage({
      channel: user,
      text: `✅ *Lead creado en Salesforce*\n• ID: *${response.data.id}*`,
    });

  } catch (error) {
    console.error('❌ Error al crear Lead:', error.response?.data || error.message);
    await client.chat.postMessage({
      channel: user,
      text: `❌ Error al crear el Lead:\n${error.response?.data[0]?.message || 'Error desconocido'}`,
    });
  }
});

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡ Slack app running on port', process.env.PORT || 3000);
})();
