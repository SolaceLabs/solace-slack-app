const EventPortal = require('./epwrapper')
const JsonDB = require('node-json-db').JsonDB;
const db = new JsonDB('tokens', true, false);

const { constructErrorUnfurl,
        buildDomainBlocks,
        buildApplicationBlocks,
        buildEventBlocks,
        buildSchemaBlocks,
        buildEnumBlocks } = require('./buildBlocks');

const parseSolaceLink = (link) => {
  let objects = ['domains', 'applications', 'events', 'schemas' ];
  let url = new URL(link.replaceAll('&amp;', '&'));
  if (!url.pathname.startsWith('/ep'))
    return false;
  let item = {};
  let splits = url.pathname.split('/ep/designer/');
  if (splits.length <= 1 || (splits[0] === '' && splits[1] === '')) {
      item = {
        query: 'domains',
        name: 'Domains'
      }
  } else {
    let tokens = splits[1].split('/');

    tokens.forEach((token, index) => {
      if (objects.includes(token)) {
        (index+1 < tokens.length) ? item[token] = tokens[index+1] : '';
        item.query = token;
        item.name = token.charAt(0).toUpperCase() + token.slice(1);
      }
    })
  }

  for (const [key, value] of url.searchParams.entries()) {
    item[key] = value;
    if (key === 'selectedId')
      item[item.query] = value;
  }

  return item;
}

const appHomeOpenedEvent = async({event, context, payload}) => {
  console.log('bot:app_home_opened');
  const { app } = require('./app')
  const appHome = require('./appHome');

  const userId = payload.user;

  // Display App Home
  const homeView = await appHome.createHome(userId);
  
  try {
    const result = await app.client.views.publish({
      token: context.botToken,
      user_id: event.user,
      view: homeView
    });
    
  } catch(e) {
    app.error(e);
  }  
}

const appLinkSharedEvent = async({event, context, payload}) => {
  console.log('bot:link_shared');
  const { app } = require('./app')
  for (var i=0; i<payload.links.length; i++) {
    try {
      let unfurledData = [];
      let item = parseSolaceLink(payload.links[i].url);

      let solaceCloudToken = null;
      try {
        solaceCloudToken = db.getData(`/${payload.user}/data`);
      } catch(error) {
        console.error(error); 
        return;
      };
      
      let result = null;
      let results = [];
      let blocks = [];
      const ep = new EventPortal(solaceCloudToken.token);
      if (item.query === 'domains') {
        let params = new URLSearchParams({ include: 'stats' }).toString();

        result = item.selectedDomainId ?
                    await ep.getApplicationDomainByID(item.selectedDomainId, item.selectedVersionId, params) :                    
                    await ep.getApplicationDomains(params);
        blocks = buildDomainBlocks(result, solaceCloudToken.domain);
      } else if (item.query === 'applications') {
        let domain = await ep.getApplicationDomainByID(item.domains);
        let params = new URLSearchParams();
        if (item.hasOwnProperty('selectedVersionId')) params.append('selectedVersionId', item.selectedVersionId);
        if (item.hasOwnProperty('domains')) params.append('applicationDomainId', item.domains);
        if (item.hasOwnProperty('domainName')) params.append('name', item.domainName);

        if (item.hasOwnProperty('applications'))
          result = await ep.getApplicationByID(item.applications, params);
        else
          result = await ep.getApplications(params);

        results = results.concat(result);
        blocks = buildApplicationBlocks(results, solaceCloudToken.domain, item);
      } else if (item.query === 'events') {
        let domain = await ep.getApplicationDomainByID(item.domains);
        let events = await ep.getEvents();
        if (!item.events) {
          result = events.filter(el => el.applicationDomainId === item.domains);
          result.map(el => el.domainName = domain.name);
        } else {
          let vEvent = await ep.getEventByID(item.events, item.selectedVersionId);
          let found = events.find((el) => {
            return el.id === vEvent.id;
          })
          vEvent.name = found.name;
          vEvent.domainName = domain.name;
          result = vEvent;
        }
        blocks = buildEventBlocks(result, solaceCloudToken.domain, item);        
      } else if (item.query === 'schemas') {
        let domain = await ep.getApplicationDomainByID(item.domains);
        let schemas = await ep.getSchemas();
        if (!item.schemas) {
          result = schemas.filter(el => el.applicationDomainId === item.domains);
          result.map(el => el.domainName = domain.name);
        } else {
          let vSchema = await ep.getSchemaByID(item.schemas, item.selectedVersionId);
          let found = schemas.find((el) => {
            return el.id === vSchema.schemaId;
          })
          vSchema.name = found.name;
          vSchema.applicationDomainId = found.applicationDomainId;
          vSchema.domainName = domain.name;
          result = vSchema;
        }
        blocks = buildSchemaBlocks(result, solaceCloudToken.domain, item);        
      }
          
      unfurledData.push({
        url: payload.links[i].url,
        query: item.query,
        item,
        result,
        blocks
      });

      let unfurls = {};
      unfurls[payload.links[i].url] = {
        blocks
      }
      await app.client.chat.unfurl({
        token: process.env.SLACK_BOT_TOKEN,
        ts: event.message_ts,
        channel: payload.channel,
        unfurls: unfurls,
        text: 'Unfurl successful'
      });
    } catch (error) {
      console.log(error);
      let blocks = constructErrorUnfurl(error.data.error)
      await app.client.chat.postMessage({
        token: process.env.SLACK_BOT_TOKEN,
        ts: event.message_ts,
        channel: payload.channel,
        blocks,
        text: 'Unfurl error'
      });
    }
  }
}

module.exports = { 
  appHomeOpenedEvent,
  appLinkSharedEvent
};