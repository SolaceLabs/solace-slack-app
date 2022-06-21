// const EventPortal = require('@solace-community/eventportal')
const EventPortal = require('./epwrapper')
const JsonDB = require('node-json-db').JsonDB;
const db = new JsonDB('tokens', true, false);

const buildFields = (result) => {
  let fields = [];
  Object.keys(result).forEach(token => {
    fields.push({
      "type": "mrkdwn",
      "text": "*" + token + "*:\n" + JSON.stringify(result[token])
    });
  })
  let size = 10; 
  let arrayOfFields = [];
  for (var i=0; i<fields.length; i+=size) {
    arrayOfFields.push(fields.slice(i,i+size));
  }

  return arrayOfFields;
}

const constructCommandBlocks = (result, command) => {
  console.log('constructCommandBlocks');
  let section = [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Result:*\n\n"
      },
    },
    {
      type: "divider"
    },
  ];

  let tokens = command.replaceAll('*', '').split(' ');
  if (tokens[1] === 'list') {
    let item = tokens[2].slice(0, -1);
    item = item.charAt(0).toUpperCase() + item.slice(1);
    for (var i=0; i<result.length; i++) {
      let arrayOfFields = buildFields(result[i]);
      section.push({
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "*" + item + "[" + i + "]*"
        }
      });
      for (var j=0; j<arrayOfFields.length; j++) {
        section.push({
          "type": "section",
          fields: arrayOfFields[j]
        });
      }
      section.push({
        type: "divider"
      });
    }
  } else {
    let arrayOfFields = buildFields(result);
    for (var i=0; i<arrayOfFields.length; i++) {
      section.push({
        "type": "section",
        fields: arrayOfFields[i]
      });
    }
  }

  return section;
}

const constructEPLinks = (result, command) => {
  console.log('constructEPLinks');
  let tokens = command.replaceAll('*', '').split(' ');
  let urls = [];
  if (tokens[1] === 'list') {
    if (tokens[2] === 'domains') {
      Object.keys(result).forEach(token => {
        url = "https://solace-sso.solace.cloud/designer/domains/" + result[token].id;
        urls.push(url);
      });
    } else if (tokens[2] === 'applications') {
      Object.keys(result).forEach(token => {
        url = "https://solace-sso.solace.cloud/designer/domains/" + result[token].applicationDomainId + "/applications/" + result[token].id + "/detail";
        urls.push(url);
      });
    } else if (tokens[2] === 'events') {
      Object.keys(result).forEach(token => {
        url = "https://solace-sso.solace.cloud/designer/domains/" + result[token].applicationDomainId + "/events/" + result[token].id + "/detail";
        urls.push(url);
      });
    } else if (tokens[2] === 'schemas') {
      Object.keys(result).forEach(token => {
        url = "https://solace-sso.solace.cloud/designer/domains/" + result[token].applicationDomainId + "/schemas/" + result[token].id + "/detail";
        urls.push(url);
      });
    }
  }

  let section = [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Result:*\n\n"
      },
    },
    {
      type: "divider"
    },
  ];  

  let item = tokens[2].slice(0, -1);
  item = item.charAt(0).toUpperCase() + item.slice(1);
  for (var i=0; i<urls.length; i++) {
    section.push({
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*" + item + "[" + (i+1) + "]*\n\n<" + urls[i] + ">"
      }
    });
    section.push({
      type: "divider"
    });
  }
  return section;
}

const processSolaceCommand = async (command, payload) => {
  console.log('processSolaceCommand');
  let solaceCloudToken = null;
  try {
    solaceCloudToken = db.getData(`/${payload.user_id}/data`);
  } catch(error) {
    console.error(error); 
    return;
  };
  
console.log("COMMAND",command);
  let result = null;
  const ep = new EventPortal(solaceCloudToken.token);

  // domains
  if (command.command === 'list') {
    if (command.resource === 'domains') 
      result = await ep.getApplicationDomains();
    else if (command.resource === 'applications')
      result = await ep.getApplications();
    else if (command.resource === 'events')
      result = await ep.getEvents();
    else if (command.resource === 'schemas')
      result = await ep.getSchemas();
    else if (command.resource === 'enums')
      result = await ep.getEnums();
  } else {
    let version = null;
    let id = tokens[2];
    if (tokens.length >= 3)
      version = tokens[3];
    if (tokens[1] === 'domain') 
      result = await ep.getApplicationDomain(id, version);
    else if (tokens[1] === 'application')
    result = await ep.getApplicationByID(id, version);
    else if (tokens[1] === 'event')
      result = await ep.getEventByID(id, version);
    else if (tokens[1] === 'schema')
      result = await ep.getSchemaByID(id, version);
    else if (tokens[1] === 'enum')
      result = await ep.getEnumByID(id, version);    
  }

  return result;
}

module.exports = { 
  processSolaceCommand,
  constructCommandBlocks,
  constructEPLinks
};