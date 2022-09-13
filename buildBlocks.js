const states = { 1: "Draft", 2: "Released", 3: "Deprecated", 4: "Retired" }

const buildDomainBlocks = (results, domain, next=null) => {
  let blocks = [];
  let getString = undefined;
  let pageStart = 0;
  let remaining = 0;
  if (next && next.options && next.cmd && next.cmd.scope !== 'id') {
    if (results.length === next.options.pageSize) {
      pageStart = (next.options.pageNumber - 1) * next.options.pageSize;
      next.options.pageNumber++;
      getString = "Get more";
      if (next.meta && next.meta.pagination) {
        remaining = next.meta.pagination.count - (next.meta.pagination.pageSize * next.meta.pagination.pageNumber);
        if (remaining) getString = getString + " (" + remaining + ")";
      }
      if (!remaining) getString = undefined;
    } else {
      pageStart = (next.options.pageNumber - 1) * next.options.pageSize;
    }
  }

  for (let i = 0; i < results.length; i++) {
    let block = [];
    if (i === 0 && next.meta && next.meta.pagination && next.meta.pagination.pageNumber === 1) {
      block = block.concat([
        {
          type: "section",
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "_" + next.meta.pagination.count + " Domains(s) found!" + "_"
          },
      }]);
    }

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
      let desc = (results[i].description ? results[i].description.split(/\r?\n/) : []);
      if (results[i].description)
        desc.forEach((line, index) => desc[index] = ((line && line.length > 0) ? line : ""));
      desc = desc.length ? desc.join("\n") : ""
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
              text: desc
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
        ]
      });
    }

    block = block.concat([
      {
        type: "divider"
      }
    ]);

    if (i === results.length - 1 && getString) {
      block = block.concat([
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: getString
              },
              action_id: "click_get_more",
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

const buildApplicationBlocks = (results, domain, next=null) => {
  let blocks = [];
  let getString = undefined;
  let pageStart = 0;
  let remaining = 0;
  if (next && next.options && next.cmd && next.cmd.scope !== 'id') {
    if (results.length === next.options.pageSize) {
      pageStart = (next.options.pageNumber - 1) * next.options.pageSize;
      next.options.pageNumber++;
      getString = "Get more";
      if (next.meta && next.meta.pagination) {
        remaining = next.meta.pagination.count - (next.meta.pagination.pageSize * next.meta.pagination.pageNumber);
        if (remaining) getString = getString + " (" + remaining + ")";
      }
      if (!remaining) getString = undefined;
    } else {
      pageStart = (next.options.pageNumber - 1) * next.options.pageSize;
    }
  }

  for (let i = 0; i < results.length; i++) {
    let block = [];
    if (i === 0 && next.meta && next.meta.pagination && next.meta.pagination.pageNumber === 1) {
      block = block.concat([
        {
          type: "section",
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "_" + next.meta.pagination.count + " Applications(s) found!" + "_"
          },
      }]);
    }

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
      let desc = (results[i].description ? results[i].description.split(/\r?\n/) : []);
      if (results[i].description)
        desc.forEach((line, index) => desc[index] = ((line && line.length > 0) ? line : ""));
      desc = desc.length ? desc.join("\n") : ""
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
              text: desc
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

    if (i === results.length - 1 && getString) {
      block = block.concat([
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: getString
              },
              action_id: "click_get_more",
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

const buildApplicationVersionBlocks = (results, domain, next=null) => {
  let blocks = [];
  let getString = undefined;
  let pageStart = 0;
  let remaining = 0;
  if (next && next.options && next.cmd && next.cmd.scope !== 'id') {
    if (results.length === next.options.pageSize) {
      pageStart = (next.options.pageNumber - 1) * next.options.pageSize;
      next.options.pageNumber++;
      getString = "Get more";
      if (next.meta && next.meta.pagination) {
        remaining = next.meta.pagination.count - (next.meta.pagination.pageSize * next.meta.pagination.pageNumber);
        if (remaining) getString = getString + " (" + remaining + ")";
      }
      if (!remaining) getString = undefined;
    } else {
      pageStart = (next.options.pageNumber - 1) * next.options.pageSize;
    }
  }

  for (let i = 0; i < results.length; i++) {
    let block = [];
    if (i === 0 && next.meta && next.meta.pagination && next.meta.pagination.pageNumber === 1) {
      block = block.concat([
        {
          type: "section",
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "_" + next.meta.pagination.count + " Application Version(s) found!" + "_"
          },
      }]);
    }

    let desc = (results[i].description ? results[i].description.split(/\r?\n/) : []);
    if (results[i].description)
      desc.forEach((line, index) => desc[index] = ((line && line.length > 0) ? line : ""));
    desc = desc.length ? desc.join("\n") : ""

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
            text: "*Version Name*: " + (results[i].displayName ? results[i].displayName : "_None_") + "\n\n"
                  + "*Version*: <https://" + domain + "/ep/designer/domains/" 
                      + results[i].application.applicationDomainId  + "/applications/" + results[i].applicationId
                      + "?selectedVersionId=" + results[i].id
                      + "|" + results[i].version + ">\n\n"
                  + "*Description*: \n" + desc

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
            text: "*Application:*"
          },
          {
            type: "mrkdwn",
            text: "<https://" + domain + "/ep/designer/domains/" + results[i].application.applicationDomainId 
                          + "/applications?selectedId=" + results[i].applicationId
                          + "|" + results[i].application.name + ">",
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

    if (results[i].declaredProducedEventVersionIds.length) {
      let fields = [{ 
        "type": "mrkdwn", 
        "text": "*Produced Events*" 
      }];
      for (let j=0; j<results[i].declaredProducedEventVersionIds.length; j++) {
        let event = results[i].events[results[i].declaredProducedEventVersionIds[j]];
        let eventVersion = results[i].eventVersions[results[i].declaredProducedEventVersionIds[j]];
        fields.push({
            "type": "mrkdwn",
            text: "------------------------------------------\n"
                    + "*Event [" + (j+1) + "]*: <https://" + domain + "/ep/designer/domains/" 
                      + results[i].application.applicationDomainId + "/events?selectedId=" + event.id 
                      + "|" + event.name  + ">\n\n"
                    + "*Version Name*: " + (eventVersion.displayName ? eventVersion.displayName : "_None_") + "\n\n"
                    + "*Version*: <https://" + domain + "/ep/designer/domains/" 
                      + results[i].application.applicationDomainId  + "/events/" + event.id
                      + "?selectedVersionId=" + eventVersion.id
                      + "|" + eventVersion.version + ">"

        });
        fields.push({
          "type": "mrkdwn",
          "text": " "
        })
      }

      for (let k=0;k<fields.length;k+= 10) {
        const chunk = fields.slice(k, k + 10);
        block = block.concat([
          {
            "type": "section",
            "fields": chunk
          }
        ]);  
      }      
    }

    if (results[i].declaredConsumedEventVersionIds.length) {
      let fields = [{ 
        "type": "mrkdwn", 
        "text": "*Consumed Events*" 
      }];
      for (let j=0; j<results[i].declaredConsumedEventVersionIds.length; j++) {
        let event = results[i].events[results[i].declaredConsumedEventVersionIds[j]];
        let eventVersion = results[i].eventVersions[results[i].declaredConsumedEventVersionIds[j]];
        fields.push({
            "type": "mrkdwn",
            text: "------------------------------------------\n"
                    + "*Event [" + (j+1) + "]*: <https://" + domain + "/ep/designer/domains/" 
                      + results[i].application.applicationDomainId + "/events?selectedId=" + event.id 
                      + "|" + event.name  + ">\n\n"
                    + "*Version Name*: " + (eventVersion.displayName ? eventVersion.displayName : "_None_") + "\n\n"
                    + "*Version*: <https://" + domain + "/ep/designer/domains/" 
                      + results[i].application.applicationDomainId  + "/events/" + event.id
                      + "?selectedVersionId=" + eventVersion.id
                      + "|" + eventVersion.version + ">"            
        });
        fields.push({
          "type": "mrkdwn",
          "text": " "
        })

      }
      for (let k=0;k<fields.length;k+= 10) {
        const chunk = fields.slice(k, k + 10);
        block = block.concat([
          {
            "type": "section",
            "fields": chunk
          }
        ]);  
      }      
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
          "text": "_Produced Events Count:_ " + results[i].declaredProducedEventVersionIds.length
        },      
        {
          "type": "mrkdwn",
          "text": "_Consumed Events Count:_ " + results[i].declaredConsumedEventVersionIds.length
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

    if (i === results.length - 1 && getString) {
      block = block.concat([
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: getString
              },
              action_id: "click_get_more",
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

const buildApplicationEventBlocks = (results, domain, next=null) => {
  let blocks = [];
  let getString = undefined;
  let pageStart = 0;
  let remaining = 0;
  if (next && next.options && next.cmd && next.cmd.scope !== 'id') {
    if (results.length === next.options.pageSize) {
      pageStart = (next.options.pageNumber - 1) * next.options.pageSize;
      next.options.pageNumber++;
      getString = "Get more";
      if (next.meta && next.meta.pagination) {
        remaining = next.meta.pagination.count - (next.meta.pagination.pageSize * next.meta.pagination.pageNumber);
        if (remaining) getString = getString + " (" + remaining + ")";
      }
      if (!remaining) getString = undefined;
    } else {
      pageStart = (next.options.pageNumber - 1) * next.options.pageSize;
    }
  }

  for (let i = 0; i < results.length; i++) {
    let block = [];
    if (i === 0 && next.meta && next.meta.pagination && next.meta.pagination.pageNumber === 1) {
      block = block.concat([
        {
          type: "section",
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "_" + next.meta.pagination.count + " Application Event(s) found!" + "_"
          },
      }]);
    }

    let schemaDesc = "";
    if (results[i].schemaVersion && results[i].schemaVersion.description) {
      let schemaDescArr = (results[i].schemaVersion.description ? results[i].schemaVersion.description.split(/\r?\n/) : []);
      if (results[i].schemaVersion.description)
        schemaDescArr.forEach((line, index) => schemaDescArr[index] = ((line && line.length > 0) ? line : ""));
      schemaDesc = schemaDescArr.length ? schemaDescArr.join("\n") : ""
    }

    let eventDesc = "";
    if (results[i].description) {
      let eventDescArr = (results[i].description ? results[i].description.split(/\r?\n/) : []);
      if (results[i].description)
        eventDescArr.forEach((line, index) => eventDescArr[index] = ((line && line.length > 0) ? line : ""));
      eventDesc = eventDescArr.length ? eventDescArr.join("\n") : ""
    }

    block = block.concat([
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: "*Event [" + (pageStart+i+1) + "]:*"
          },
          {
            type: "mrkdwn",
            text: "<https://" + domain + "/ep/designer/domains/" 
                  + results[i].applicationDomainId  + "/events?selectedId=" + results[i].event.id 
                  + "|" + results[i].event.name + ">"
          },
        ],
      },    
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: "*Event Version:* "
          },
          {
            type: "mrkdwn",
            text: "*Version Name*: " + (results[i].displayName ? results[i].displayName : "_None_") + "\n\n"
                  + "*Version*: <https://" + domain + "/ep/designer/domains/" 
                    + results[i].applicationDomainId  + "/events/" + results[i].event.id 
                    + "?selectedVersionId=" + results[i].id
                    + "|" + results[i].version + ">\n\n"
                  + "*Description*: \n" + eventDesc
          },
        ],
      }
    ]);

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
                    + results[i].applicationDomainId  + "/schemas?selectedId=" + results[i].schema.id 
                    + "|" + results[i].schema.name + ">"
            },
          ],
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: "*Schema Version:* "
            },
            {
              type: "mrkdwn",
              text: "*Version Name*: " + (results[i].schemaVersion.displayName ? results[i].schemaVersion.displayName : "_None_") + "\n\n"
                    + "*Version*: <https://" + domain + "/ep/designer/domains/" 
                      + results[i].applicationDomainId  + "/schemas/" + results[i].schema.id 
                      + "?selectedVersionId=" + results[i].schemaVersion.id
                      + "|" + results[i].schemaVersion.version + ">\n\n"
                    + "*Description*: \n" + schemaDesc
            },
          ],
        }
      ]);
    }

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
            text: "<https://" + domain + "/ep/designer/domains/" + results[i].applicationDomainId + "/applications?selectedId=" + results[i].application.id + "|" + results[i].application.name + ">"
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
      },
    ]);

    block = block.concat([
      {
        type: "divider"
      }
    ]);

    if (i === results.length - 1 && getString) {
      block = block.concat([
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: getString
              },
              action_id: "click_get_more",
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

const buildApplicationSchemaBlocks = (results, domain, next=null) => {
  let blocks = [];
  let getString = undefined;
  let pageStart = 0;
  let remaining = 0;
  if (next && next.options && next.cmd && next.cmd.scope !== 'id') {
    if (results.length === next.options.pageSize) {
      pageStart = (next.options.pageNumber - 1) * next.options.pageSize;
      next.options.pageNumber++;
      getString = "Get more";
      if (next.meta && next.meta.pagination) {
        remaining = next.meta.pagination.count - (next.meta.pagination.pageSize * next.meta.pagination.pageNumber);
        if (remaining) getString = getString + " (" + remaining + ")";
      }
      if (!remaining) getString = undefined;
    } else {
      pageStart = (next.options.pageNumber - 1) * next.options.pageSize;
    }
  }

  for (let i = 0; i < results.length; i++) {
    let block = [];
    if (i === 0 && next.meta && next.meta.pagination && next.meta.pagination.pageNumber === 1) {
      block = block.concat([
        {
          type: "section",
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": (next.meta.pagination.count === 1) ? 
                        "_" + next.meta.pagination.count + " Application Schema references(s) found!"  + "_" :
                        "_" + next.meta.pagination.count + " Application Schema references(s) found! Here are the distinct schema(s)" + "_"
          },
      }]);
    }

    let schemaDesc = "";
    if (results[i].schemaVersion && results[i].schemaVersion.description) {
      let schemaDescArr = (results[i].schemaVersion.description ? results[i].schemaVersion.description.split(/\r?\n/) : []);
      if (results[i].schemaVersion.description)
        schemaDescArr.forEach((line, index) => schemaDescArr[index] = ((line && line.length > 0) ? line : ""));
      schemaDesc = schemaDescArr.length ? schemaDescArr.join("\n") : ""
    }

    let eventDesc = "";
    if (results[i].description) {
      let eventDescArr = (results[i].description ? results[i].description.split(/\r?\n/) : []);
      if (results[i].description)
        eventDescArr.forEach((line, index) => eventDescArr[index] = ((line && line.length > 0) ? line : ""));
      eventDesc = eventDescArr.length ? eventDescArr.join("\n") : ""
    }

    block = block.concat([
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: "*Schema [" + (pageStart+i+1) + "]:*"
          },
          {
            type: "mrkdwn",
            text: "<https://" + domain + "/ep/designer/domains/" 
                  + results[i].applicationDomainId  + "/schemas?selectedId=" + results[i].schema.id 
                  + "|" + results[i].schema.name + ">"
          },
        ],
      },    
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: "*Schema Version:* "
          },
          {
            type: "mrkdwn",
            text: "*Version Name*: " + (results[i].schemaVersion.displayName ? results[i].schemaVersion.displayName : "_None_") + "\n\n"
                  + "*Version*: <https://" + domain + "/ep/designer/domains/" 
                    + results[i].applicationDomainId  + "/schemas/" + results[i].schema.id 
                    + "?selectedVersionId=" + results[i].schemaVersion.id
                    + "|" + results[i].schemaVersion.version + ">\n\n"
                  + "*Description*: \n" + schemaDesc
          },
        ],
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
                  + results[i].applicationDomainId  + "/events?selectedId=" + results[i].event.id 
                  + "|" + results[i].event.name + ">"
          },
        ],
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: "*Event Version:* "
          },
          {
            type: "mrkdwn",
            text: "*Version Name*: " + (results[i].displayName ? results[i].displayName : "_None_") + "\n\n"
                  + "*Version*: <https://" + domain + "/ep/designer/domains/" 
                    + results[i].applicationDomainId  + "/events/" + results[i].eventId 
                    + "?selectedVersionId=" + results[i].id
                    + "|" + results[i].version + ">\n\n"
                  + "*Description*: \n" + eventDesc
          },
        ],
      },      
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: "*Application:*"
          },
          {
            type: "mrkdwn",
            text: "<https://" + domain + "/ep/designer/domains/" + results[i].applicationDomainId + "/applications?selectedId=" + results[i].application.id + "|" + results[i].application.name + ">"
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
      },
    ]);

    block = block.concat({
      "type": "context",
      "elements": [
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
      ]
    });    

    block = block.concat([
      {
        type: "divider"
      }
    ]);

    if (i === results.length - 1 && getString) {
      block = block.concat([
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: getString
              },
              action_id: "click_get_more",
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

const buildEventBlocks = (results, domain, next=null) => {
  let blocks = [];
  let getString = undefined;
  let pageStart = 0;
  let remaining = 0;
  if (next && next.options && next.cmd && next.cmd.scope !== 'id') {
    if (results.length === next.options.pageSize) {
      pageStart = (next.options.pageNumber - 1) * next.options.pageSize;
      next.options.pageNumber++;
      getString = "Get more";
      if (next.meta && next.meta.pagination) {
        remaining = next.meta.pagination.count - (next.meta.pagination.pageSize * next.meta.pagination.pageNumber);
        if (remaining) getString = getString + " (" + remaining + ")";
      }
      if (!remaining) getString = undefined;
    } else {
      pageStart = (next.options.pageNumber - 1) * next.options.pageSize;
    }
  }

  for (let i = 0; i < results.length; i++) {
    let block = [];
    if (i === 0 && next.meta && next.meta.pagination && next.meta.pagination.pageNumber === 1) {
      block = block.concat([
        {
          type: "section",
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "_" + next.meta.pagination.count + " Events(s) found!" + "_"
          },
      }]);
    }

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
                      + results[i].applicationDomainId  + "/events?selectedId=" + results[i].id 
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
      let desc = (results[i].description ? results[i].description.split(/\r?\n/) : []);
      if (results[i].description)
        desc.forEach((line, index) => desc[index] = ((line && line.length > 0) ? line : ""));
      desc = desc.length ? desc.join("\n") : ""
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
              text: desc
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

    if (i === results.length - 1 && getString) {
      block = block.concat([
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: getString
              },
              action_id: "click_get_more",
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
  let getString = undefined;
  let pageStart = 0;
  let remaining = 0;
  if (next && next.options && next.cmd && next.cmd.scope !== 'id') {
    if (results.length === next.options.pageSize) {
      pageStart = (next.options.pageNumber - 1) * next.options.pageSize;
      next.options.pageNumber++;
      getString = "Get more";
      if (next.meta && next.meta.pagination) {
        remaining = next.meta.pagination.count - (next.meta.pagination.pageSize * next.meta.pagination.pageNumber);
        if (remaining) getString = getString + " (" + remaining + ")";
      }
      if (!remaining) getString = undefined;
    } else {
      pageStart = (next.options.pageNumber - 1) * next.options.pageSize;
    }
  }

  for (let i = 0; i < results.length; i++) {
    let desc = (results[i].description ? results[i].description.split(/\r?\n/) : []);
    if (results[i].description)
      desc.forEach((line, index) => desc[index] = ((line && line.length > 0) ? line : ""));
    desc = desc.length ? desc.join("\n") : ""

    let block = [];
    if (i === 0 && next.meta && next.meta.pagination && next.meta.pagination.pageNumber === 1) {
      block = block.concat([
        {
          type: "section",
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "_" + next.meta.pagination.count + " Event Version(s) found!" + "_"
          },
      }]);
    }

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
            text: "*Version Name*: " + (results[i].displayName ? results[i].displayName : "_None_") + "\n\n"
                    + "*Version*: <https://" + domain + "/ep/designer/domains/" 
                      + results[i].applicationDomainId  + "/events/" + results[i].eventId
                      + "?selectedVersionId=" + results[i].id
                      + "|" + results[i].version + ">\n\n"
                    + "*Description*: \n" + desc
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
            text: "*Event:*"
          },
          {
            type: "mrkdwn",
            text: "<https://" + domain + "/ep/designer/domains/" 
                      + results[i].applicationDomainId  + "/events?selectedId=" + results[i].eventId 
                      + "|" + results[i].event.name + ">"
          },
        ]
      }
    ]);
    

    if (results[i].schema) {
      let schema = results[i].schema;
      let schemaVersion = results[i].schemaVersion;
      let desc = (schemaVersion.description ? schemaVersion.description.split(/\r?\n/) : []);
      if (schemaVersion.description)
        desc.forEach((line, index) => desc[index] = ((line && line.length > 0) ? line : ""));
      desc = desc.length ? desc.join("\n") : ""
  
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
              text: "*Name*: <https://" + domain + "/ep/designer/domains/" 
                      + results[i].applicationDomainId + "/schemas?selectedId=" + schema.id
                      + "|" + schema.name  + ">\n\n"
                    + "*Version Name*: " + (schemaVersion.displayName ? schemaVersion.displayName : "_None_") + "\n\n"
                    + "*Version*: <https://" + domain + "/ep/designer/domains/" 
                        + results[i].applicationDomainId  + "/schemas/" + schema.id
                        + "?selectedVersionId=" + schemaVersion.id
                        + "|" + schemaVersion.version + ">\n\n"
                    + "*Description*: " + desc

            }
          ]
        },
      ]);
    }

    if (results[i].declaredProducingApplicationVersionIds.length) {
      let fields = [{ 
        "type": "mrkdwn", 
        "text": "*Producing Applications*" 
      }];
      for (let j=0; j<results[i].declaredProducingApplicationVersionIds.length; j++) {
        let app = results[i].apps[results[i].declaredProducingApplicationVersionIds[j]];
        let appVersion = results[i].appVersions[results[i].declaredProducingApplicationVersionIds[j]];

        fields.push({
            "type": "mrkdwn",
            text: "------------------------------------------\n"
                    + "*Application [" + (j+1) + "]*: <https://" + domain + "/ep/designer/domains/" 
                      + results[i].applicationDomainId + "/applications?selectedId=" + app.id 
                      + "|" + app.name  + ">\n\n"
                    + "*Version Name*: " + (appVersion.displayName ? appVersion.displayName : "_None_") + "\n\n"
                    + "*Version*: <https://" + domain + "/ep/designer/domains/" 
                      + results[i].applicationDomainId  + "/applications/" + app.id
                      + "?selectedVersionId=" + appVersion.id
                      + "|" + appVersion.version + ">"            
        });        

        fields.push({
          "type": "mrkdwn",
          "text": " "
        });
      }
      for (let k=0;k<fields.length;k+= 10) {
        const chunk = fields.slice(k, k + 10);
        block = block.concat([
          {
            "type": "section",
            "fields": chunk
          }
        ]);  
      }      
    }

    if (results[i].declaredConsumingApplicationVersionIds.length) {
      let fields = [{ 
        "type": "mrkdwn", 
        "text": "*Consuming Applications*" 
      }];
      for (let j=0; j<results[i].declaredConsumingApplicationVersionIds.length; j++) {
        let app = results[i].apps[results[i].declaredConsumingApplicationVersionIds[j]];
        let appVersion = results[i].appVersions[results[i].declaredConsumingApplicationVersionIds[j]];
        fields.push({
            "type": "mrkdwn",
            text: "------------------------------------------\n"
                    + "*Application [" + (j+1) + "]*: <https://" + domain + "/ep/designer/domains/" 
                      + results[i].applicationDomainId + "/applications?selectedId=" + app.id 
                      + "|" + app.name  + ">\n\n"
                    + "*Version Name*: " + (appVersion.displayName ? appVersion.displayName : "_None_") + "\n\n"
                    + "*Version*: <https://" + domain + "/ep/designer/domains/" 
                      + results[i].applicationDomainId  + "/applications/" + app.id
                      + "?selectedVersionId=" + appVersion.id
                      + "|" + appVersion.version + ">"            
        });        
        fields.push({
          "type": "mrkdwn",
          "text": " "
        });
      }
      for (let k=0;k<fields.length;k+= 10) {
        const chunk = fields.slice(k, k + 10);
        block = block.concat([
          {
            "type": "section",
            "fields": chunk
          }
        ]);  
      }      
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
          "text": "_Producing Applications Count:_ " + results[i].declaredProducingApplicationVersionIds.length
        },      
        {
          "type": "mrkdwn",
          "text": "_Consuming Applications Count:_ " + results[i].declaredConsumingApplicationVersionIds.length
        },      
      ]
    });    

    block = block.concat([
      {
        type: "divider"
      }
    ]);

    if (i === results.length - 1 && getString) {
      block = block.concat([
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: getString
              },
              action_id: "click_get_more",
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
  let getString = undefined;
  let pageStart = 0;
  let remaining = 0;
  if (next && next.options && next.cmd && next.cmd.scope !== 'id') {
    if (results.length === next.options.pageSize) {
      pageStart = (next.options.pageNumber - 1) * next.options.pageSize;
      next.options.pageNumber++;
      getString = "Get more";
      if (next.meta && next.meta.pagination) {
        remaining = next.meta.pagination.count - (next.meta.pagination.pageSize * next.meta.pagination.pageNumber);
        if (remaining) getString = getString + " (" + remaining + ")";
      }
      if (!remaining) getString = undefined;
    } else {
      pageStart = (next.options.pageNumber - 1) * next.options.pageSize;
    }
  }

  for (let i = 0; i < results.length; i++) {
    let block = [];
    if (i === 0 && next.meta && next.meta.pagination && next.meta.pagination.pageNumber === 1) {
      block = block.concat([
        {
          type: "section",
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "_" + next.meta.pagination.count + " Schema(s) found!" + "_"
          },
      }]);
    }

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
      let desc = (results[i].description ? results[i].description.split(/\r?\n/) : []);
      if (results[i].description)
        desc.forEach((line, index) => desc[index] = ((line && line.length > 0) ? line : ""));
      desc = desc.length ? desc.join("\n") : ""
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
              text: desc
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

    if (i === results.length - 1 && getString) {
      block = block.concat([
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: getString
              },
              action_id: "click_get_more",
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

const buildSchemaVersionBlocks = (results, domain, next=null) => {
  let blocks = [];
  let getString = undefined;
  let pageStart = 0;
  let remaining = 0;
  if (next && next.options && next.cmd && next.cmd.scope !== 'id') {
    if (results.length === next.options.pageSize) {
      pageStart = (next.options.pageNumber - 1) * next.options.pageSize;
      next.options.pageNumber++;
      getString = "Get more";
      if (next.meta && next.meta.pagination) {
        remaining = next.meta.pagination.count - (next.meta.pagination.pageSize * next.meta.pagination.pageNumber);
        if (remaining) getString = getString + " (" + remaining + ")";
      }
      if (!remaining) getString = undefined;
    } else {
      pageStart = (next.options.pageNumber - 1) * next.options.pageSize;
    }
  }

  for (let i = 0; i < results.length; i++) {
    let block = [];
    if (i === 0 && next.meta && next.meta.pagination && next.meta.pagination.pageNumber === 1) {
      block = block.concat([
        {
          type: "section",
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "_" + next.meta.pagination.count + " Schema Version(s) found!" + "_"
          },
      }]);
    }

    let desc = (results[i].description ? results[i].description.split(/\r?\n/) : []);
    if (results[i].description)
      desc.forEach((line, index) => desc[index] = ((line && line.length > 0) ? line : ""));
    desc = desc.length ? desc.join("\n") : ""

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
            text: "*Version Name*: " + (results[i].displayName ? results[i].displayName : "_None_") + "\n\n"
                  + "*Version*: <https://" + domain + "/ep/designer/domains/" 
                    + results[i].applicationDomainId  + "/schemas/" + results[i].schemaId 
                    + "?selectedVersionId=" + results[i].id
                    + "|" + results[i].version + ">\n\n"
                  + "*Description*: \n" + desc
          },
        ],
      },
    ]);

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
                      + results[i].applicationDomainId  + "/schemas?selectedId=" + results[i].schemaId
                      + "|" + results[i].schema.name + ">"
            },
          ]
        },
      ]);
    }
    
    if (results[i].referencedByEventVersionIds && results[i].referencedByEventVersionIds.length) {
      let fields = [{ 
        "type": "mrkdwn", 
        "text": "*Referencing Events*" 
      }];
      for (let j=0; j<results[i].referencedByEventVersionIds.length; j++) {
        let event = results[i].events[results[i].referencedByEventVersionIds[j]];
        let eventVersion = results[i].eventVersions[results[i].referencedByEventVersionIds[j]];
        fields.push({
            "type": "mrkdwn",
            text: "------------------------------------------\n"
                    + "*Event [" + (j+1) + "]*: <https://" + domain + "/ep/designer/domains/" 
                      + results[i].applicationDomainId + "/events?selectedId=" + event.id 
                      + "|" + event.name  + ">\n\n"
                    + "*Version Name*: " + (eventVersion.displayName ? eventVersion.displayName : "_None_") + "\n\n"
                    + "*Version*: <https://" + domain + "/ep/designer/domains/" 
                      + results[i].applicationDomainId  + "/events/" + event.id
                      + "?selectedVersionId=" + eventVersion.id
                      + "|" + eventVersion.version + ">"            
        });

        fields.push({
          "type": "mrkdwn",
          "text": " "
        });
      }
      for (let k=0;k<fields.length;k+= 10) {
        const chunk = fields.slice(k, k + 10);
        block = block.concat([
          {
            "type": "section",
            "fields": chunk
          }
        ]);  
      }      
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

    if (i === results.length - 1 && getString) {
      block = block.concat([
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: getString
              },
              action_id: "click_get_more",
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
  buildDomainBlocks,
  buildApplicationVersionBlocks,
  buildApplicationBlocks,
  buildApplicationEventBlocks,
  buildApplicationSchemaBlocks,
  buildEventBlocks,
  buildEventVersionBlocks,
  buildSchemaBlocks,
  buildSchemaVersionBlocks
};