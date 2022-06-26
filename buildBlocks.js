const states = { 1: "Draft", 2: "Released", 3: "Deprecated", 4: "Retired" }

const constructErrorUnfurl = (error) => {
  let blocks = [
    {
      type: "divider"
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*Discover, Visualize and Catalog Your Event Streams With PubSub+ Event Portal*\n\n\n"
      },
    },
    {
      type: "divider"
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": ":boom: Hey there 👋 I'm SolaceBot. Could not process your request due to _`"
                  + error + "`_. Sorry about that!"
                  + "\n\n\nIt could be due to following reasons:"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*:one:* The link is not a valid Solace Event Portal link from domains _`solace-sso.solace.cloud`_ or _`console.solace.cloud`_"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*:two:* The link is from *v1.0 Event Portal*." 
                + " Ensure that the links are from a *v2.0* Event Portal.\n\n\n"
                + " :bulb: To enable *v2.0*, go to Event Portal *Home* and turn _*on*_ the *New Event Portal 2.0* option."
      }
    },
  ]

  return blocks;
}

const buildDomainBlocks = (results, domain, next=null) => {
  let blocks = [];
  
  let getstr = undefined;
  let pageStart = 0;
  if (next && next.options && next.cmd && next.cmd.scope !== 'id') {
    if (next.options.pageSize === 1) {
      next.options.pageNumber = 1;
      next.options.pageSize = 5;
      getstr = "Get all";
    } else if (results.length === next.options.pageSize) {
      pageStart = (next.options.pageNumber - 1) * next.options.pageSize;
      next.options.pageNumber++;
      getstr = "Get more"
    } else {
      pageStart = (next.options.pageNumber - 1) * next.options.pageSize;
    }
  }

  for (let i = 0; i < results.length; i++) {
    let block = [];
    block = block.concat([
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*Domain [" + (pageStart+i+1) + "]:*"
        },
        accessory: {
          "action_id": "block_actions",
          "type": "static_select",
          "placeholder": {
            "type": "plain_text",
            "emoji": true,
            "text": "Manage"
          },
          "options": [
            {
              "text": {
                "type": "plain_text",
                "emoji": true,
                "text": "Get Applications"
              },
              "value": "getdomainapplications|"+results[i].id+"|"+results[i].name
            },
            {
              "text": {
                "type": "plain_text",
                "emoji": true,
                "text": "Get Events"
              },
              "value": "getdomainevents|"+results[i].id+"|"+results[i].name
            },
            {
              "text": {
                "type": "plain_text",
                "emoji": true,
                "text": "Get Schemas"
              },
              "value": "getdomainschemas|"+results[i].id+"|"+results[i].name
            },
          ]
        }      
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: "*Domain*"
          },
          {
            type: "mrkdwn",
            text: "<https://" + domain + "/ep/designer/domains?selectedDomainId=" + results[i].id + "|" + results[i].name + ">",
          },
        ]
      }

    ]);

    if (results[i].description) {
      let desc = (results[i].description ? results[i].description.split(/\r?\n/) : "");
      desc.forEach((line, index) => desc[index] = ((line && line.length > 0) ? "_" + line + "_" : ""));
      block = block.concat([
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: "*Description:*"
            },
            {
              type: "mrkdwn",
              text: desc.join("\n")
            },
          ]
        }
      ]);
    }

    if (results[i].stats) {
      block = block.concat({
        "type": "context",
        "elements": [
          {
            "type": "mrkdwn",
            "text": "_Application Count:_ " 
                            + "<https://" + domain + "/ep/designer/domains/" 
                            + results[i].id + "/applications?domainName=" + results[i].name 
                            + "|*" + results[i].stats.applicationCount + "*>",
          },
          {
            "type": "mrkdwn",
            "text": "_Event Count:_ " 
                            + "<https://" + domain + "/ep/designer/domains/" 
                            + results[i].id + "/events?domainName=" + results[i].name 
                            + "|*" + results[i].stats.eventCount + "*>",
          },
          {
            "type": "mrkdwn",
            "text": "_Schema Count:_ " 
                            + "<https://" + domain + "/ep/designer/domains/" 
                            + results[i].id + "/schemas?domainName=" + results[i].name 
                            + "|*" + results[i].stats.schemaCount + "*>",
          },
          {
            "type": "mrkdwn",
            "text": "_Enum Count:_ " 
                            + "<https://" + domain + "/ep/designer/domains/" 
                            + results[i].id + "/enums?domainName=" + results[i].name 
                            + "|*" + results[i].stats.enumCount + "*>",
          },
        ]
      });
    }

    block = block.concat([
      {
        type: "divider"
      }
    ]);

    if (i === results.length - 1 && getstr) {
      block = block.concat([
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: getstr
              },
              action_id: "click_get_all",
              value: JSON.stringify(next)
            },
          ]
        },
        {
          type: "divider"
        }
      ]);
    }
    blocks.push(block);
  }

  return blocks;
}

const buildApplicationBlocks = (results, domain, next=null) => {
  let blocks = [];
  let getstr = undefined;
  let pageStart = 0;
  if (next && next.options && next.cmd && next.cmd.scope !== 'id') {
    if (next.options.pageSize === 1) {
      next.options.pageNumber = 1;
      next.options.pageSize = 5;
      getstr = "Get all";
    } else if (results.length === next.options.pageSize) {
      pageStart = (next.options.pageNumber - 1) * next.options.pageSize;
      next.options.pageNumber++;
      getstr = "Get more"
    } else {
      pageStart = (next.options.pageNumber - 1) * next.options.pageSize;
    }
  }

  for (let i = 0; i < results.length; i++) {
    let block = [];
    block = block.concat([
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*Application [" + (pageStart+i+1) + "]:*",
        },
        accessory: {
          "action_id": "block_actions",
          "type": "static_select",
          "placeholder": {
            "type": "plain_text",
            "emoji": true,
            "text": "Manage"
          },
          "options": [
            {
              "text": {
                "type": "plain_text",
                "emoji": true,
                "text": "Get Versions"
              },
              "value": "getapplicationversions|"+results[i].id+"|"+results[i].name+"|"+results[i].applicationDomainId+"|"+results[i].domainName
            },
            {
              "text": {
                "type": "plain_text",
                "emoji": true,
                "text": "Get Events"
              },
              "value": "getapplicationevents|"+results[i].id+"|"+results[i].name+"|"+results[i].applicationDomainId+"|"+results[i].domainName
            },
            {
              "text": {
                "type": "plain_text",
                "emoji": true,
                "text": "Get Schemas"
              },
              "value": "getapplicationschemas|"+results[i].id+"|"+results[i].name+"|"+results[i].applicationDomainId+"|"+results[i].domainName
            },            
          ]
        }      
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: "*Application: *"
          },
          {
            type: "mrkdwn",
            text: "<https://" + domain + "/ep/designer/domains/" + results[i].applicationDomainId 
                          + "/applications?selectedId=" + results[i].id + "|" + results[i].name + ">",
          },
        ]
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: "*Domain:*"
          },
          {
            type: "mrkdwn",
            text: "<https://" + domain + "/ep/designer/domains/"
                          + "?selectedDomainId=" + results[i].applicationDomainId + "|" + results[i].domainName + ">",
          },
        ]
      },
    ]);

    if (results[i].description) {
      let desc = (results[i].description ? results[i].description.split(/\r?\n/) : "");
      desc.forEach((line, index) => desc[index] = ((line && line.length > 0) ? "_" + line + "_" : ""));
      block = block.concat([
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: "*Description:*"
            },
            {
              type: "mrkdwn",
              text: desc.join("\n")
            },
          ]
        }
      ]);
    }

    block = block.concat({
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "_Number of versions:_ <https://" + domain + "/ep/designer/domains/" + results[i].applicationDomainId 
                      + "/applications/" + results[i].id
                      + "|" + results[i].numberOfVersions 
                      + ">"
        },      
        {
          "type": "mrkdwn",
          "text": "_Application Type:_ " + results[i].applicationType
        },      

      ]
    });

    block = block.concat([
      {
        type: "divider"
      }
    ]);

    if (i === results.length - 1 && getstr) {
      block = block.concat([
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: getstr
              },
              action_id: "click_get_all",
              value: JSON.stringify(next)
            },
          ]
        },
        {
          type: "divider"
        }
      ]);
    }
    blocks.push(block);
  }

  return blocks;
}

const buildApplicationVersionBlocks = (results, domain, next=null) => {
  let blocks = [];
  let getstr = undefined;
  let pageStart = 0;
  if (next && next.options && next.cmd && next.cmd.scope !== 'id') {
    if (next.options.pageSize === 1) {
      next.options.pageNumber = 1;
      next.options.pageSize = 5;
      getstr = "Get all";
    } else if (results.length === next.options.pageSize) {
      pageStart = (next.options.pageNumber - 1) * next.options.pageSize;
      next.options.pageNumber++;
      getstr = "Get more"
    } else {
      pageStart = (next.options.pageNumber - 1) * next.options.pageSize;
    }
  }

  for (let i = 0; i < results.length; i++) {
    let block = [];
    block = block.concat([
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: "*Application:*"
          },
          {
            type: "mrkdwn",
            text: "<https://" + domain + "/ep/designer/domains/" + results[i].application.applicationDomainId 
                          + "/applications/" + results[i].applicationId
                          + "?domainName=" + results[i].domainName + "|" + results[i].application.name + ">",
          },
        ]
      },
    ]);

    block = block.concat([
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: "*Domain:*"
          },
          {
            type: "mrkdwn",
            text: "<https://" + domain + "/ep/designer/domains/"
                          + "?selectedDomainId=" + results[i].application.applicationDomainId  + "|" + results[i].domainName + ">",
          },
        ]
      }
    ]);

    block = block.concat([
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: "*Application Version [" + (pageStart+i+1) + "]:*"
          },
          {
            type: "mrkdwn",
            text: "<https://" + domain + "/ep/designer/domains/" + results[i].application.applicationDomainId 
                          + "/applications/" + results[i].applicationId 
                          + "?domainName=" + results[i].domainName 
                          + "&selectedVersionId=" + results[i].id + "|" + results[i].displayName + " (" + results[i].version + ") >",
          },
        ]
      },
    ]);

    if (results[i].description) {
      let desc = (results[i].description ? results[i].description.split(/\r?\n/) : "");
      desc.forEach((line, index) => desc[index] = ((line && line.length > 0) ? "_" + line + "_" : ""));
      block = block.concat([
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: "*Description:*"
            },
            {
              type: "mrkdwn",
              text: desc.join("\n")
            },
          ]
        }
      ]);
    }

    if (results[i].producedEvents.length) {
      let fields = [{ 
        "type": "mrkdwn", 
        "text": "*Produced Events*" 
      }];
      for (let j=0; j<results[i].producedEvents.length; j++) {
        fields.push({
            "type": "mrkdwn",
            "text": "<https://" + domain + "/ep/designer/domains/" 
                      + results[i].application.applicationDomainId + "/events/" + results[i].producedEvents[j].id 
                      + "|" + results[i].producedEvents[j].name  + ">"
        });
        fields.push({
          "type": "mrkdwn",
          "text": " "
        });
      }
      block = block.concat([
        {
          "type": "section",
          "fields": fields
        }
      ]);  
    }

    if (results[i].consumedEvents.length) {
      let fields = [{ 
        "type": "mrkdwn", 
        "text": "*Consumed Events*" 
      }];
      for (let j=0; j<results[i].consumedEvents.length; j++) {
        fields.push({
            "type": "mrkdwn",
            "text": "<https://" + domain + "/ep/designer/domains/" 
                      + results[i].application.applicationDomainId  + "/events/" + results[i].consumedEvents[j].id 
                      + "|" + results[i].consumedEvents[j].name  + ">"
        });
        fields.push({
          "type": "mrkdwn",
          "text": " "
        });
      }
      block = block.concat([
        {
          "type": "section",
          "fields": fields
        }
      ]);
    }    

    block = block.concat({
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "_State:_ " + states[results[i].stateId]
        },      
        {
          "type": "mrkdwn",
          "text": "_Produced Events Count:_ " + results[i].producedEvents.length
        },      
        {
          "type": "mrkdwn",
          "text": "_Consumed Events Count:_ " + results[i].consumedEvents.length
        },      
        {
          "type": "mrkdwn",
          "text": "_Consumers:_ " + results[i].consumers.length
        },      
      ]
    });

    block = block.concat([
      {
        type: "divider"
      }
    ]);

    if (i === results.length - 1 && getstr) {
      block = block.concat([
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: getstr
              },
              action_id: "click_get_all",
              value: JSON.stringify(next)
            },
          ]
        },
        {
          type: "divider"
        }
      ]);
    }
    blocks.push(block);
  }

  return blocks;
}

const buildEventBlocks = (results, domain, next=null) => {
  let blocks = [];
  let getstr = undefined;
  let pageStart = 0;
  if (next && next.options && next.cmd && next.cmd.scope !== 'id') {
    if (next.options.pageSize === 1) {
      next.options.pageNumber = 1;
      next.options.pageSize = 5;
      getstr = "Get all";
    } else if (results.length === next.options.pageSize) {
      pageStart = (next.options.pageNumber - 1) * next.options.pageSize;
      next.options.pageNumber++;
      getstr = "Get more"
    } else {
      pageStart = (next.options.pageNumber - 1) * next.options.pageSize;
    }
  }

  for (let i = 0; i < results.length; i++) {
    let block = [];

    block = block.concat([
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*Event [" + (pageStart+i+1) + "]:*",
        },
        accessory: {
          "action_id": "block_actions",
          "type": "static_select",
          "placeholder": {
            "type": "plain_text",
            "emoji": true,
            "text": "Manage"
          },
          "options": [
            {
              "text": {
                "type": "plain_text",
                "emoji": true,
                "text": "Get Versions"
              },
              "value": "geteventversions|"+results[i].id+"|"+results[i].name+"|"+results[i].applicationDomainId+"|"+results[i].domainName
            },
          ]
        }   
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: "*Event:*"
          },
          {
            type: "mrkdwn",
            text: "<https://" + domain + "/ep/designer/domains/" 
                      + results[i].applicationDomainId  + "/events/" + results[i].id 
                      + "|" + results[i].name + ">"
          },
        ]
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: "*Domain:*"
          },
          {
            type: "mrkdwn",
            text: "<https://" + domain + "/ep/designer/domains?selectedDomainId=" + results[i].applicationDomainId + "|" + results[i].domainName + ">"
          },
        ]
      }
    ]);

    if (results[i].description) {
      let desc = (results[i].description ? results[i].description.split(/\r?\n/) : "");
      desc.forEach((line, index) => desc[index] = ((line && line.length > 0) ? "_" + line + "_" : ""));
      block = block.concat([
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: "*Description:*"
            },
            {
              type: "mrkdwn",
              text: desc.join("\n")
            },
          ]
        }
      ]);
    }

    block = block.concat({
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "_Number of versions:_ <https://" + domain + "/ep/designer/domains/" + results[i].applicationDomainId 
                      + "/events/" + results[i].id
                      + "?domainName=" + results[i].domainName 
                      + "|" + results[i].numberOfVersions 
                      + ">"
        },      
        {
          "type": "mrkdwn",
          "text": "_Shared:_ " + results[i].shared
        },      

      ]
    });    


    block = block.concat([
      {
        type: "divider"
      }
    ]);

    if (i === results.length - 1 && getstr) {
      block = block.concat([
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: getstr
              },
              action_id: "click_get_all",
              value: JSON.stringify(next)
            },
          ]
        },
        {
          type: "divider"
        }
      ]);
    }

    blocks = blocks.concat(block);
  }

  return blocks;
}

const buildEventVersionBlocks = (results, domain, next=null) => {
  let blocks = [];
  let getstr = undefined;
  let pageStart = 0;
  if (next && next.options && next.cmd && next.cmd.scope !== 'id') {
    if (next.options.pageSize === 1) {
      next.options.pageNumber = 1;
      next.options.pageSize = 5;
      getstr = "Get all";
    } else if (results.length === next.options.pageSize) {
      pageStart = (next.options.pageNumber - 1) * next.options.pageSize;
      next.options.pageNumber++;
      getstr = "Get more"
    } else {
      pageStart = (next.options.pageNumber - 1) * next.options.pageSize;
    }
  }

  blocks.push({
    type: "section",
    fields: [
      {
        type: "mrkdwn",
        text: "*Event:*"
      },
      {
        type: "mrkdwn",
        text: "<https://" + domain + "/ep/designer/domains/" 
                  + results[0].applicationDomainId  + "/events/" + results[0].eventId 
                  + "|" + results[0].event.name + ">"
      },
    ]
  });

  for (let i = 0; i < results.length; i++) {
    let block = [];
    block = block.concat([
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: "*Event Version [" + (pageStart+i+1) + "]:*"
          },
          {
            type: "mrkdwn",
            text: "<https://" + domain + "/ep/designer/domains/" 
                      + results[i].applicationDomainId  + "/events/" + results[i].eventId 
                      + "?selectedVersionId=" + results[i].id
                      + "|" + results[i].displayName + " (" + results[i].version + ")>"
          },
        ]
      },
    ]);

    if (results[i].description) {
      let desc = (results[i].description ? results[i].description.split(/\r?\n/) : "");
      desc.forEach((line, index) => desc[index] = ((line && line.length > 0) ? "_" + line + "_" : ""));
      block = block.concat([
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: "*Description:*"
            },
            {
              type: "mrkdwn",
              text: desc.join("\n")
            },
          ]
        }
      ]);
    }

    if (results[i].schema) {
      block = block.concat([
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: "*Schema:*"
            },
            {
              type: "mrkdwn",
              text: "<https://" + domain + "/ep/designer/domains/" 
                        + results[i].applicationDomainId  + "/schemas/" + results[i].schema.id 
                        + "|" + results[i].schema.name + ">\n\n"
                    + "    <https://" + domain + "/ep/designer/domains/" 
                        + results[i].applicationDomainId  + "/schemas/" + results[i].schema.id 
                        + "?selectedVersionId=" + results[i].schemaVersionId
                        + "|" + results[i].schemaVersion.displayName + ">"
            }
          ]
        },
      ]);
    }

    if (results[i].producingApps.length) {
      let fields = [{ 
        "type": "mrkdwn", 
        "text": "*Producing Applications*" 
      }];
      for (let j=0; j<results[i].producingApps.length; j++) {
        fields.push({
            "type": "mrkdwn",
            "text": "<https://" + domain + "/ep/designer/domains/" 
                      + results[i].applicationDomainId  + "/applications/" + results[i].producingApps[j].applicationId 
                      + "?domainName=" + results[i].domainName 
                      + "|" + results[i].producingApps[j].applicationName + ">\n\n"
                    + "    <https://" + domain + "/ep/designer/domains/" 
                      + results[i].applicationDomainId  + "/applications/" + results[i].producingApps[j].applicationId 
                      + "?domainName=" + results[i].domainName                     
                      + "&selectedVersionId=" + results[i].producingApps[j].id
                      + "|" + results[i].producingApps[j].displayName  
                      + " (" + results[i].producingApps[j].version + ")"  
                      + ">"

        });
        fields.push({
          "type": "mrkdwn",
          "text": " "
        });
      }
      block = block.concat([
        {
          "type": "section",
          "fields": fields
        }
      ]);  
    }

    if (results[i].consumingApps.length) {
      let fields = [{ 
        "type": "mrkdwn", 
        "text": "*Consuming Applications*" 
      }];
      for (let j=0; j<results[i].consumingApps.length; j++) {
        fields.push({
            "type": "mrkdwn",
            "text": "<https://" + domain + "/ep/designer/domains/" 
                      + results[i].applicationDomainId  + "/applications/" + results[i].consumingApps[j].applicationId 
                      + "?domainName=" + results[i].domainName 
                      + "|" + results[i].consumingApps[j].applicationName + ">\n\n"
                    + "    <https://" + domain + "/ep/designer/domains/" 
                      + results[i].applicationDomainId  + "/applications/" + results[i].consumingApps[j].applicationId 
                      + "?domainName=" + results[i].domainName                     
                      + "&selectedVersionId=" + results[i].consumingApps[j].id
                      + "|" + results[i].consumingApps[j].displayName  
                      + " (" + results[i].consumingApps[j].version + ")"  
                      + ">"
        });
        fields.push({
          "type": "mrkdwn",
          "text": " "
        });
      }
      block = block.concat([
        {
          "type": "section",
          "fields": fields
        }
      ]);
    }

    block = block.concat({
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "_State:_ " + states[results[i].stateId]
        },      
        {
          "type": "mrkdwn",
          "text": "_Producing Applications Count:_ " + results[i].producingApps.length
        },      
        {
          "type": "mrkdwn",
          "text": "_Consuming Applicationsts Count:_ " + results[i].consumingApps.length
        },      
      ]
    });    

    block = block.concat([
      {
        type: "divider"
      }
    ]);

    if (i === results.length - 1 && getstr) {
      block = block.concat([
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: getstr
              },
              action_id: "click_get_all",
              value: JSON.stringify(next)
            },
          ]
        },
        {
          type: "divider"
        }
      ]);
    }

    blocks = blocks.concat(block);
  }

  return blocks;
}

const buildSchemaBlocks = (results, domain, next=null) => {
  let blocks = [];
  let getstr = undefined;
  let pageStart = 0;
  if (next && next.options && next.cmd && next.cmd.scope !== 'id') {
    if (next.options.pageSize === 1) {
      next.options.pageNumber = 1;
      next.options.pageSize = 5;
      getstr = "Get all";
    } else if (results.length === next.options.pageSize) {
      pageStart = (next.options.pageNumber - 1) * next.options.pageSize;
      next.options.pageNumber++;
      getstr = "Get more"
    } else {
      pageStart = (next.options.pageNumber - 1) * next.options.pageSize;
    }
  }

  for (let i = 0; i < results.length; i++) {
    let block = [];
    block = block.concat([
      {
        type: "section",
        text: {
            type: "mrkdwn",
            text: "*Schema [" + (pageStart+i+1) + "]:*"
          },
        accessory: {
          "action_id": "block_actions",
          "type": "static_select",
          "placeholder": {
            "type": "plain_text",
            "emoji": true,
            "text": "Manage"
          },
          "options": [
            {
              "text": {
                "type": "plain_text",
                "emoji": true,
                "text": "Get Versions"
              },
              "value": "getschemaversions|"+results[i].id+"|"+results[i].name+"|"+results[i].applicationDomainId+"|"+results[i].domainName
            }
          ]
        }     
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: "*Schema:*"
          },
          {
            type: "mrkdwn",
            text: "<https://" + domain + "/ep/designer/domains/" 
                  + results[i].applicationDomainId  + "/schemas?selectedId=" + results[i].id 
                  + "|" + results[i].name + ">"
          },
        ],
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: "*Domain:*"
          },
          {
            type: "mrkdwn",
            text: "<https://" + domain + "/ep/designer/domains?selectedDomainId=" + results[i].applicationDomainId + "|" + results[i].domainName + ">"
          },
        ]
      },
    ]);

    if (results[i].description) {
      let desc = (results[i].description ? results[i].description.split(/\r?\n/) : "");
      desc.forEach((line, index) => desc[index] = ((line && line.length > 0) ? "_" + line + "_" : ""));
      block = block.concat([
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: "*Description:*"
            },
            {
              type: "mrkdwn",
              text: desc.join("\n")
            },
          ]
        }
      ]);
    }

    block = block.concat({
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "_Number of versions:_ <https://" + domain + "/ep/designer/domains/" + results[i].applicationDomainId 
                      + "/schemas/" + results[i].id
                      + "?domainName=" + results[i].domainName 
                      + "|" + results[i].numberOfVersions 
                      + ">"
        },      
        {
          "type": "mrkdwn",
          "text": "_Shared:_ " + results[i].shared
        },      
        {
          "type": "mrkdwn",
          "text": "_Content Type:_ " + results[i].contentType
        },      
        {
          "type": "mrkdwn",
          "text": "_Schema Type:_ " + results[i].schemaType
        },      
        {
          "type": "mrkdwn",
          "text": "_Event Reference Count:_ " + results[i].eventVersionRefCount
        },      
      ]
    });    

    block = block.concat([
      {
        type: "divider"
      }
    ]);

    if (i === results.length - 1 && getstr) {
      block = block.concat([
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: getstr
              },
              action_id: "click_get_all",
              value: JSON.stringify(next)
            },
          ]
        },
        {
          type: "divider"
        }
      ]);
    }
    blocks.push(block);
  }

  return blocks;
}

const buildSchemaVersionBlocks = (results, domain, next=null) => {
  let blocks = [];
  let getstr = undefined;
  let pageStart = 0;
  if (next && next.options && next.cmd && next.cmd.scope !== 'id') {
    if (next.options.pageSize === 1) {
      next.options.pageNumber = 1;
      next.options.pageSize = 5;
      getstr = "Get all";
    } else if (results.length === next.options.pageSize) {
      pageStart = (next.options.pageNumber - 1) * next.options.pageSize;
      next.options.pageNumber++;
      getstr = "Get more"
    } else {
      pageStart = (next.options.pageNumber - 1) * next.options.pageSize;
    }
  }

  for (let i = 0; i < results.length; i++) {
    let block = [];
    if (results[i].schema) {
      block = block.concat([
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: "*Schema:*"
            },
            {
              type: "mrkdwn",
              text: "<https://" + domain + "/ep/designer/domains/" 
                      + results[i].applicationDomainId  + "/schemas/" + results[i].schemaId
                      + "|" + results[i].schema.name + ">"
            },
          ]
        },
      ]);
    }

    block = block.concat([
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: "*Schema Version [" + (pageStart+i+1) + "]:* "
          },
          {
            type: "mrkdwn",
            text: "<https://" + domain + "/ep/designer/domains/" 
                    + results[i].applicationDomainId  + "/schemas/" + results[i].schemaId 
                    + "?selectedVersionId=" + results[i].id
                    + "|" + results[i].displayName + " (" + results[i].version + ")>"
          }
        ],
      },
    ]);

    if (results[i].description) {
      let desc = (results[i].description ? results[i].description.split(/\r?\n/) : "");
      desc.forEach((line, index) => desc[index] = ((line && line.length > 0) ? "_" + line + "_" : ""));
      block = block.concat([
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: "*Description:*"
            },
            {
              type: "mrkdwn",
              text: desc.join("\n")
            },
          ]
        }
      ]);
    }

    if (results[i].eventVersions && results[i].eventVersions.length) {
      let fields = [{ 
        "type": "mrkdwn", 
        "text": "*Referencing Events*" 
      }];
      for (let j=0; j<results[i].eventVersions.length; j++) {
        fields.push({
            "type": "mrkdwn",
            "text": "<https://" + domain + "/ep/designer/domains/" 
                      + results[i].applicationDomainId  + "/events/"
                      + "?domainName=" + results[i].domainName 
                      + "&selectedId=" + results[i].eventVersions[j].eventId
                      + "|" + results[i].eventVersions[j].event.name  + ">\n\n"
                    + "    <https://" + domain + "/ep/designer/domains/" 
                      + results[i].applicationDomainId  + "/events/" + results[i].eventVersions[j].eventId 
                      + "?domainName=" + results[i].domainName 
                      + "&selectedVersionId=" + results[i].eventVersions[j].id
                      + "|" + results[i].eventVersions[j].displayName  
                      + " (" + results[i].eventVersions[j].version + ")"  
                      + ">"
        });

        fields.push({
          "type": "mrkdwn",
          "text": " "
        });
      }
      block = block.concat([
        {
          "type": "section",
          "fields": fields
        }
      ]);  
    }


    block = block.concat({
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "_State:_ " + states[results[i].stateId]
        },      
        {
          "type": "mrkdwn",
          "text": "_Shared:_ " + results[i].schema.shared
        },      
        {
          "type": "mrkdwn",
          "text": "_Content Type:_ " + results[i].schema.contentType
        },      
        {
          "type": "mrkdwn",
          "text": "_Schema Type:_ " + results[i].schema.schemaType
        },      
        {
          "type": "mrkdwn",
          "text": "_Referencing Events Count:_ " + (results[i].referencedByEventVersionIds ? results[i].referencedByEventVersionIds.length : 0)
        },      
      ]
    });    

    block = block.concat([
      {
        type: "divider"
      }
    ]);

    if (i === results.length - 1 && getstr) {
      block = block.concat([
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: getstr
              },
              action_id: "click_get_all",
              value: JSON.stringify(next)
            },
          ]
        },
        {
          type: "divider"
        }
      ]);
    }

    blocks = blocks.concat(block);
  }

  return blocks;
}

module.exports = { 
  constructErrorUnfurl,
  buildDomainBlocks,
  buildApplicationVersionBlocks,
  buildApplicationBlocks,
  buildEventBlocks,
  buildEventVersionBlocks,
  buildSchemaBlocks,
  buildSchemaVersionBlocks
};