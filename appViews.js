const modalView = async ({ ack, body, context, view }) => {
  console.log('view:modal_view');
  ack();

  const { app } = require('./app')
  const appHome = require('./appHome');
  const ts = new Date();
  
  const data = {
    timestamp: ts.toLocaleString(),
    token: view.state.values.token.content.value,
    domain: view.state.values.domain.content.selected_option.value,
    username: body.user.username,
    userid: body.user.id
  }

  const homeView = await appHome.createHome(body.user.id, data);

  try {
    const result = await app.client.apiCall('views.publish', {
      token: context.botToken,
      user_id: body.user.id,
      view: homeView
    });

  } catch(e) {
    logError(e);
    app.error(e);
  }
    
}

module.exports = { 
  modalView,
};