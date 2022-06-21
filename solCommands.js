const EventPortal = require('./epwrapper')

const getSolaceApplicationDomains = async (mode, solaceCloudToken, options=null) => {
  let results = [];
  let params = new URLSearchParams();

  const ep = new EventPortal(solaceCloudToken.token);

  params.append('include', 'stats');
  if (mode === 'name') params.append('name', options.name);
  if (options.hasOwnProperty('sort')) params.append('sort', 'name:'+options.sort);

  if (mode === 'all' || mode === 'name') {
    let result = await ep.getApplicationDomains(params);
    results = results.concat(result);
  } else if (mode === 'id') {
    let result = await ep.getApplicationDomainByID(options.id, params);
    results = results.concat(result);
  }

  return results;
}

const getSolaceApplications = async (mode, solaceCloudToken, options=null) => {
  let results = [];
  let params = new URLSearchParams();
  const ep = new EventPortal(solaceCloudToken.token);

  if (mode === 'name') params.append('name', options.name);
  if (options.hasOwnProperty('domainId')) params.append('applicationDomainId', options.domainId);
  if (options.hasOwnProperty('type')) params.append('applicationType', options.type);
  if (options.hasOwnProperty('sort')) params.append('sort', 'name:'+options.sort);

  if (mode === 'all' || mode === 'name') {
    let result = await ep.getApplications(params);
    results = results.concat(result);
  } else if (mode === 'id') {
    let result = await ep.getApplicationByID(options.id, params);
    results = results.concat(result);
  }

  let domains = {};
  for (let i=0; i<results.length; i++) {
    if (!domains[results[i].applicationDomainId])
      domains[results[i].applicationDomainId] = await ep.getApplicationDomainName(results[i].applicationDomainId);
    results[i].domainName = domains[results[i].applicationDomainId];
  }

  return results;
}

const getSolaceApplicationVersions = async (applictionId, solaceCloudToken, options=null) => {
  let results = [];
  let params = new URLSearchParams();
  const ep = new EventPortal(solaceCloudToken.token);

  // params.append('id', applictionId);

  let result = await ep.getApplicationVersions(applictionId, params);
  results = results.concat(result);

  let domains = {};
  for (let i=0; i<results.length; i++) {
    if (!domains[results[i].applicationDomainId])
      domains[results[i].applicationDomainId] = await ep.getApplicationDomainName(results[i].applicationDomainId);
    results[i].domainName = domains[results[i].applicationDomainId];
  }

  return results;
}

const getSolaceEvents = async (mode, solaceCloudToken, options=null) => {
  let results = [];
  let params = new URLSearchParams();

  const ep = new EventPortal(solaceCloudToken.token);

  if (mode === 'name') params.append('name', options.name);
  if (options.hasOwnProperty('domainId')) params.append('applicationDomainId', options.domainId);
  if (options.hasOwnProperty('shared')) params.append('shared', options.shared);
  if (options.hasOwnProperty('sort')) params.append('sort', 'name:'+options.sort);

  if (mode === 'all' || mode === 'name') {
    let result = await ep.getEvents(params);
    results = results.concat(result);
  } else if (mode === 'id') {
    let result = await ep.getEventByID(options.id, params);
    results = results.concat(result);
  }

  let domains = {};
  for (let i=0; i<results.length; i++) {
    if (!domains[results[i].applicationDomainId])
      domains[results[i].applicationDomainId] = await ep.getApplicationDomainName(results[i].applicationDomainId);
    results[i].domainName = domains[results[i].applicationDomainId];
  }

  return results;
}

const getSolaceSchemas = async (mode, solaceCloudToken, options=null) => {
  let results = [];
  let params = new URLSearchParams();

  const ep = new EventPortal(solaceCloudToken.token);

  if (mode === 'name') params.append('name', options.name);
  if (options.hasOwnProperty('domainId')) params.append('applicationDomainId', options.domainId);
  if (options.hasOwnProperty('shared')) params.append('shared', options.shared);
  if (options.hasOwnProperty('sort')) params.append('sort', 'name:'+options.sort);

  if (mode === 'all' || mode === 'name') {
    let result = await ep.getSchemas(params);
    results = results.concat(result);
  } else if (mode === 'id') {
    let result = await ep.getSchemaByID(options.id, params);
    results = results.concat(result);
  }

  let domains = {};
  for (let i=0; i<results.length; i++) {
    if (!domains[results[i].applicationDomainId])
      domains[results[i].applicationDomainId] = await ep.getApplicationDomainName(results[i].applicationDomainId);
    results[i].domainName = domains[results[i].applicationDomainId];
  }

  console.log('EVENTS', results);
  return results;
}

const getApplicationDomainId = async (domainName, solaceCloudToken) => {
  console.log('I am here...');
  const ep = new EventPortal(solaceCloudToken.token);

  try {
    console.log('Get Id for name: ' + domainName);
    let id = await ep.getApplicationDomainID(domainName);
    console.log('Got Id for name: ' + domainName + ' :: ' + id);
    return id;
  } catch (error) {
    console.log('getApplicationDomainId Error: ', error);
    return null;
  }
}

module.exports = {
  getSolaceApplicationDomains,
  getSolaceApplications,
  getSolaceApplicationVersions,
  getSolaceEvents,
  getSolaceSchemas,
  getApplicationDomainId
}