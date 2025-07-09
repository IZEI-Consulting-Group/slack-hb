const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Slack App is running!');
});

app.post('/slack/command', async (req, res) => {
  const triggerId = req.body.trigger_id;

  const modal = {
    type: 'modal',
    title: { type: 'plain_text', text: 'Registrar Proyecto' },
    submit: { type: 'plain_text', text: 'Enviar' },
    close: { type: 'plain_text', text: 'Cancelar' },
    callback_id: 'proyecto_submit',
    blocks: [
      {
        type: 'input',
        block_id: 'nombre',
        label: { type: 'plain_text', text: 'Nombre del Proyecto' },
        element: { type: 'plain_text_input', action_id: 'input' }
      },
      {
        type: 'input',
        block_id: 'responsable',
        label: { type: 'plain_text', text: 'Responsable' },
        element: { type: 'plain_text_input', action_id: 'input' }
      }
    ]
  };

  await axios.post('https://slack.com/api/views.open', {
    trigger_id: triggerId,
    view: modal
  }, {
    headers: {
      Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });

  res.send('');
});

app.post('/slack/interactivity', async (req, res) => {
  const payload = JSON.parse(req.body.payload);
  if (payload.type === 'view_submission') {
    const values = payload.view.state.values;
    const data = {
      nombre: values.nombre.input.value,
      responsable: values.responsable.input.value
    };

    console.log('Datos del formulario:', data);
    res.send('');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
