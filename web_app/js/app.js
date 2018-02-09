const noop = () => { };

// Borrowed from:
//   https://codepad.co/snippet/v3nM2Oj2
const getJSONP = (() => {
    return {
        send: (src, options) => {
            let callback_name = options.callbackName || 'foo',
                on_success = options.onSuccess || noop,
                on_timeout = options.onTimeout || noop,
                timeout = options.timeout || 10; // seconds

            let timeout_trigger = window.setTimeout(() => {
                window[callback_name] = noop;
                on_timeout();
            }, timeout * 1000);

            window[callback_name] = (data) => {
                window.clearTimeout(timeout_trigger);
                on_success(data);
            }

            let script = document.createElement('script');
            script.type = 'text/javascript';
            script.async = true;
            script.src = src;

            document.getElementsByTagName('head')[0].appendChild(script);
        }
    };
})();

const makeJsonpRequest = (store) => {
    getJSONP.send('/api/simple_jsnop?callback=execute_jsonp_callback', {
        callbackName: 'execute_jsonp_callback',
        onSuccess: (responseText) => {
            console.log('JSONP request OK. Data is ', responseText, Zone.current.name);

            let response = {
                data: ''
            };

            try {
                response = JSON.parse(responseText);
            } catch (err) {
                response = {
                    data: 'invalid JSON'
                };
            }

            store.dispatch({
                type: 'JSONP_COMPLETE',
                data: response.data
            });
        }
    });
};

const makeGetRequest = (store) => {
    let xhr = new XMLHttpRequest();

    xhr.open('GET', 'api/simple_get');
    xhr.onload = () => {
        if (xhr.status === 200) {
            console.log('GET request OK. Data is ', xhr.responseText, Zone.current.name);

            let response = {
                data: ''
            };

            try {
                response = JSON.parse(xhr.responseText);
            } catch (err) {
                response = {
                    data: 'invalid JSON'
                };
            }

            store.dispatch({
                type: 'GET_COMPLETE',
                data: response.data
            });
        } else {
            console.log('GET request failed. Returned status of ', xhr.status);
        }
    };
    xhr.send();
};

const reducer = (state, action) => {
    if (typeof state === 'undefined') {
        return {
            getTriggered: false,
            getResult: '',

            jsonpTriggered: false,
            jsonpResult: ''
        };
    }

    let newState = {
        getTriggered: state.getTriggered,
        getResult: state.getResult,

        jsonpTriggered: state.jsonpTriggered,
        jsonpResult: state.jsonpResult
    };

    switch (action.type) {
        case 'TRIGGER_GET':
            newState.getTriggered = true;
            makeGetRequest(store);
            break;
        case 'TRIGGER_JSONP':
            newState.jsonpTriggered = true;
            makeJsonpRequest(store);
            break;
        case 'GET_COMPLETE':
            newState.getResult = action.data;
            break;
        case 'JSONP_COMPLETE':
            newState.jsonpResult = action.data;
            break;
        default:
            break;
    }

    return newState;
};

const { createStore } = Redux;
const store = createStore(reducer);

const ResultsComponent = ({
    getTriggered, getResult,
    jsonpTriggered, jsonpResult
}) => (
        <div>
            {
                (() => {
                    if (getTriggered) {
                        return <div>GET result: {getResult}</div>;
                    }
                })()
            }

            {
                (() => {
                    if (jsonpTriggered) {
                        return <div>JSONP result: {jsonpResult}</div>;
                    }
                })()
            }
        </div>
    );

const ButtonsComponent = ({ triggerGet, triggerJsonp }) => (
    <div>
        <button onClick={triggerGet}>Get</button>
        <button onClick={triggerJsonp}>JSONP</button>
    </div>
);

class RootComponent extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const currentState = store.getState();

        return <div>
            <ResultsComponent
                getTriggered={currentState.getTriggered}
                getResult={currentState.getResult}
                jsonpTriggered={currentState.jsonpTriggered}
                jsonpResult={currentState.jsonpResult}
            />
            <ButtonsComponent
                triggerGet={() => {
                    store.dispatch({
                        type: 'TRIGGER_GET'
                    });
                }}
                triggerJsonp={() => {
                    store.dispatch({
                        type: 'TRIGGER_JSONP'
                    });
                }}
            />
        </div>;
    }
}

const render = () => {
    ReactDOM.render(
        <RootComponent />,
        document.getElementById('root')
    );
};

const rootZone = Zone.current;
const newZone = rootZone.fork({
    name: 'new',
    onScheduleTask: (delegate, currentZone, targetZone, task) => {
        console.log('new zone: onScheduleTask');
        console.log(`---> eventName = ${task.eventName}`);
        console.log(`---> eventName = ${task.source}`);

        return delegate.scheduleTask(targetZone, task);
    },
    onInvokeTask: (delegate, current, target, task, applyThis, applyArgs) => {
        console.log('new zone: onInvokeTask');
        console.log(`---> eventName = ${task.eventName}`);
        console.log(`---> eventName = ${task.source}`);

        try {
            return delegate.invokeTask(target, task, applyThis, applyArgs);
        } finally {

        }
    },
    cancelTask: () => {
        console.log('new zone: cancelTask');
    },
    onHasTask: () => {
        console.log('new zone: onHasTask');
    },
    onHandleError: (delegate, current, target, error) => {
        console.log('new zone: onHandleError');
        console.log(error);

        delegate.handleError(target, error);

        return false;
    }
});
console.log(rootZone.name, newZone.parent.name);
Zone['__zone_symbol__jsonp']({
    jsonp: getJSONP,
    sendFuncName: 'send',
    successFuncName: 'execute_jsonp_callback'
});
newZone.run(() => {
    console.log(Zone.current.name, Zone.current === newZone);

    store.subscribe(render);
    render();
});
