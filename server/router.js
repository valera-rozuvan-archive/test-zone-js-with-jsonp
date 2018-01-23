const Router = {};

const projRoot = __dirname + '/..';

Router.index = (request, response) => {
    response.sendFile('index.html', { root: projRoot + '/web_app' });
};

Router.error = (request, response) => {
    throw new Error('Oops!');
};

Router.notFound = (request, response) => {
    response.sendFile('not_found.html', { root: projRoot + '/web_app' });
};

Router.simpleGet = (request, response) => {
    const dataResponse = {
        data: '[get ok 42]'
    };

    response.send(dataResponse);
};

Router.simpleJSONP = (request, response) => {
    const dataResponse = {
        data: '[jsonp ok 97]'
    };

    response.jsonp(JSON.stringify(dataResponse));
};

module.exports = Router;
