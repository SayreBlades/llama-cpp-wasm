var Module = (() => {
	var _scriptName = import.meta.url;

	return (
		async function(moduleArg = {}) {
			var moduleRtn;

			function GROWABLE_HEAP_I8() {
				if (wasmMemory.buffer != HEAP8.buffer) {
					updateMemoryViews()
				}
				return HEAP8
			}

			function GROWABLE_HEAP_U8() {
				if (wasmMemory.buffer != HEAP8.buffer) {
					updateMemoryViews()
				}
				return HEAPU8
			}

			function GROWABLE_HEAP_I16() {
				if (wasmMemory.buffer != HEAP8.buffer) {
					updateMemoryViews()
				}
				return HEAP16
			}

			function GROWABLE_HEAP_I32() {
				if (wasmMemory.buffer != HEAP8.buffer) {
					updateMemoryViews()
				}
				return HEAP32
			}

			function GROWABLE_HEAP_U32() {
				if (wasmMemory.buffer != HEAP8.buffer) {
					updateMemoryViews()
				}
				return HEAPU32
			}

			function GROWABLE_HEAP_F32() {
				if (wasmMemory.buffer != HEAP8.buffer) {
					updateMemoryViews()
				}
				return HEAPF32
			}

			function GROWABLE_HEAP_F64() {
				if (wasmMemory.buffer != HEAP8.buffer) {
					updateMemoryViews()
				}
				return HEAPF64
			}
			var Module = moduleArg;
			var readyPromiseResolve, readyPromiseReject;
			var readyPromise = new Promise((resolve, reject) => {
				readyPromiseResolve = resolve;
				readyPromiseReject = reject
			});
			var ENVIRONMENT_IS_WEB = typeof window == "object";
			var ENVIRONMENT_IS_WORKER = typeof importScripts == "function";
			var ENVIRONMENT_IS_NODE = typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string";
			var ENVIRONMENT_IS_PTHREAD = ENVIRONMENT_IS_WORKER && self.name == "em-pthread";
			if (ENVIRONMENT_IS_NODE) {
				const {
					createRequire: createRequire
				} = await import("module");
				var require = createRequire(import.meta.url);
				var worker_threads = require("worker_threads");
				global.Worker = worker_threads.Worker;
				ENVIRONMENT_IS_WORKER = !worker_threads.isMainThread;
				ENVIRONMENT_IS_PTHREAD = ENVIRONMENT_IS_WORKER && worker_threads["workerData"] == "em-pthread"
			}
			var moduleOverrides = Object.assign({}, Module);
			var arguments_ = [];
			var thisProgram = "./this.program";
			var quit_ = (status, toThrow) => {
				throw toThrow
			};
			var scriptDirectory = "";

			function locateFile(path) {
				if (Module["locateFile"]) {
					return Module["locateFile"](path, scriptDirectory)
				}
				return scriptDirectory + path
			}
			var readAsync, readBinary;
			if (ENVIRONMENT_IS_NODE) {
				var fs = require("fs");
				var nodePath = require("path");
				scriptDirectory = require("url").fileURLToPath(new URL("./", import.meta.url));
				readBinary = filename => {
					filename = isFileURI(filename) ? new URL(filename) : nodePath.normalize(filename);
					var ret = fs.readFileSync(filename);
					return ret
				};
				readAsync = (filename, binary = true) => {
					filename = isFileURI(filename) ? new URL(filename) : nodePath.normalize(filename);
					return new Promise((resolve, reject) => {
						fs.readFile(filename, binary ? undefined : "utf8", (err, data) => {
							if (err) reject(err);
							else resolve(binary ? data.buffer : data)
						})
					})
				};
				if (!Module["thisProgram"] && process.argv.length > 1) {
					thisProgram = process.argv[1].replace(/\\/g, "/")
				}
				arguments_ = process.argv.slice(2);
				quit_ = (status, toThrow) => {
					process.exitCode = status;
					throw toThrow
				}
			} else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
				if (ENVIRONMENT_IS_WORKER) {
					scriptDirectory = self.location.href
				} else if (typeof document != "undefined" && document.currentScript) {
					scriptDirectory = document.currentScript.src
				}
				if (_scriptName) {
					scriptDirectory = _scriptName
				}
				if (scriptDirectory.startsWith("blob:")) {
					scriptDirectory = ""
				} else {
					scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, "").lastIndexOf("/") + 1)
				}
				if (!ENVIRONMENT_IS_NODE) {
					if (ENVIRONMENT_IS_WORKER) {
						readBinary = url => {
							var xhr = new XMLHttpRequest;
							xhr.open("GET", url, false);
							xhr.responseType = "arraybuffer";
							xhr.send(null);
							return new Uint8Array(xhr.response)
						}
					}
					readAsync = url => {
						if (isFileURI(url)) {
							return new Promise((resolve, reject) => {
								var xhr = new XMLHttpRequest;
								xhr.open("GET", url, true);
								xhr.responseType = "arraybuffer";
								xhr.onload = () => {
									if (xhr.status == 200 || xhr.status == 0 && xhr.response) {
										resolve(xhr.response);
										return
									}
									reject(xhr.status)
								};
								xhr.onerror = reject;
								xhr.send(null)
							})
						}
						return fetch(url, {
							credentials: "same-origin"
						}).then(response => {
							if (response.ok) {
								return response.arrayBuffer()
							}
							return Promise.reject(new Error(response.status + " : " + response.url))
						})
					}
				}
			} else {}
			if (ENVIRONMENT_IS_NODE) {
				if (typeof performance == "undefined") {
					global.performance = require("perf_hooks").performance
				}
			}
			var defaultPrint = console.log.bind(console);
			var defaultPrintErr = console.error.bind(console);
			if (ENVIRONMENT_IS_NODE) {
				defaultPrint = (...args) => fs.writeSync(1, args.join(" ") + "\n");
				defaultPrintErr = (...args) => fs.writeSync(2, args.join(" ") + "\n")
			}
			var out = Module["print"] || defaultPrint;
			var err = Module["printErr"] || defaultPrintErr;
			Object.assign(Module, moduleOverrides);
			moduleOverrides = null;
			if (Module["arguments"]) arguments_ = Module["arguments"];
			if (Module["thisProgram"]) thisProgram = Module["thisProgram"];
			if (ENVIRONMENT_IS_PTHREAD) {
				var wasmPromiseResolve;
				var wasmPromiseReject;
				if (ENVIRONMENT_IS_NODE) {
					var parentPort = worker_threads["parentPort"];
					parentPort.on("message", data => onmessage({
						data: data
					}));
					Object.assign(globalThis, {
						self: global,
						importScripts: () => {},
						postMessage: msg => parentPort.postMessage(msg),
						performance: global.performance || {
							now: Date.now
						}
					})
				}
				var initializedJS = false;

				function threadPrintErr(...args) {
					var text = args.join(" ");
					if (ENVIRONMENT_IS_NODE) {
						fs.writeSync(2, text + "\n");
						return
					}
					console.error(text)
				}
				if (!Module["printErr"]) err = threadPrintErr;

				function threadAlert(...args) {
					var text = args.join(" ");
					postMessage({
						cmd: "alert",
						text: text,
						threadId: _pthread_self()
					})
				}
				self.alert = threadAlert;
				Module["instantiateWasm"] = (info, receiveInstance) => new Promise((resolve, reject) => {
					wasmPromiseResolve = module => {
						var instance = new WebAssembly.Instance(module, getWasmImports());
						receiveInstance(instance);
						resolve()
					};
					wasmPromiseReject = reject
				});
				self.onunhandledrejection = e => {
					throw e.reason || e
				};

				function handleMessage(e) {
					try {
						var msgData = e["data"];
						var cmd = msgData["cmd"];
						if (cmd === "load") {
							let messageQueue = [];
							self.onmessage = e => messageQueue.push(e);
							self.startWorker = instance => {
								postMessage({
									cmd: "loaded"
								});
								for (let msg of messageQueue) {
									handleMessage(msg)
								}
								self.onmessage = handleMessage
							};
							for (const handler of msgData["handlers"]) {
								if (!Module[handler] || Module[handler].proxy) {
									Module[handler] = (...args) => {
										postMessage({
											cmd: "callHandler",
											handler: handler,
											args: args
										})
									};
									if (handler == "print") out = Module[handler];
									if (handler == "printErr") err = Module[handler]
								}
							}
							wasmMemory = msgData["wasmMemory"];
							updateMemoryViews();
							wasmPromiseResolve(msgData["wasmModule"])
						} else if (cmd === "run") {
							__emscripten_thread_init(msgData["pthread_ptr"], 0, 0, 1, 0, 0);
							__emscripten_thread_mailbox_await(msgData["pthread_ptr"]);
							establishStackSpace();
							PThread.receiveObjectTransfer(msgData);
							PThread.threadInitTLS();
							if (!initializedJS) {
								initializedJS = true
							}
							try {
								invokeEntryPoint(msgData["start_routine"], msgData["arg"])
							} catch (ex) {
								if (ex != "unwind") {
									throw ex
								}
							}
						} else if (cmd === "cancel") {
							if (_pthread_self()) {
								__emscripten_thread_exit(-1)
							}
						} else if (msgData.target === "setimmediate") {} else if (cmd === "checkMailbox") {
							if (initializedJS) {
								checkMailbox()
							}
						} else if (cmd) {
							err(`worker: received unknown command ${cmd}`);
							err(msgData)
						}
					} catch (ex) {
						__emscripten_thread_crashed();
						throw ex
					}
				}
				self.onmessage = handleMessage
			}
			var wasmBinary = Module["wasmBinary"];
			var wasmMemory;
			var wasmModule;
			var ABORT = false;
			var EXITSTATUS;
			var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

			function updateMemoryViews() {
				var b = wasmMemory.buffer;
				Module["HEAP8"] = HEAP8 = new Int8Array(b);
				Module["HEAP16"] = HEAP16 = new Int16Array(b);
				Module["HEAPU8"] = HEAPU8 = new Uint8Array(b);
				Module["HEAPU16"] = HEAPU16 = new Uint16Array(b);
				Module["HEAP32"] = HEAP32 = new Int32Array(b);
				Module["HEAPU32"] = HEAPU32 = new Uint32Array(b);
				Module["HEAPF32"] = HEAPF32 = new Float32Array(b);
				Module["HEAPF64"] = HEAPF64 = new Float64Array(b)
			}
			if (!ENVIRONMENT_IS_PTHREAD) {
				if (Module["wasmMemory"]) {
					wasmMemory = Module["wasmMemory"]
				} else {
					var INITIAL_MEMORY = Module["INITIAL_MEMORY"] || 838860800;
					wasmMemory = new WebAssembly.Memory({
						initial: INITIAL_MEMORY / 65536,
						maximum: 4294967296 / 65536,
						shared: true
					});
					// if (!(wasmMemory.buffer instanceof SharedArrayBuffer)) {
					// 	err("requested a shared WebAssembly.Memory but the returned buffer is not a SharedArrayBuffer, indicating that while the browser has SharedArrayBuffer it does not have WebAssembly threads support - you may need to set a flag");
					// 	if (ENVIRONMENT_IS_NODE) {
					// 		err("(on node you may need: --experimental-wasm-threads --experimental-wasm-bulk-memory and/or recent version)")
					// 	}
					// 	throw Error("bad memory")
					// }
				}
				updateMemoryViews()
			}
			var __ATPRERUN__ = [];
			var __ATINIT__ = [];
			var __ATMAIN__ = [];
			var __ATPOSTRUN__ = [];
			var runtimeInitialized = false;

			function preRun() {
				if (Module["preRun"]) {
					if (typeof Module["preRun"] == "function") Module["preRun"] = [Module["preRun"]];
					while (Module["preRun"].length) {
						addOnPreRun(Module["preRun"].shift())
					}
				}
				callRuntimeCallbacks(__ATPRERUN__)
			}

			function initRuntime() {
				runtimeInitialized = true;
				if (ENVIRONMENT_IS_PTHREAD) return;
				if (!Module["noFSInit"] && !FS.initialized) FS.init();
				FS.ignorePermissions = false;
				TTY.init();
				callRuntimeCallbacks(__ATINIT__)
			}

			function preMain() {
				if (ENVIRONMENT_IS_PTHREAD) return;
				callRuntimeCallbacks(__ATMAIN__)
			}

			function postRun() {
				if (ENVIRONMENT_IS_PTHREAD) return;
				if (Module["postRun"]) {
					if (typeof Module["postRun"] == "function") Module["postRun"] = [Module["postRun"]];
					while (Module["postRun"].length) {
						addOnPostRun(Module["postRun"].shift())
					}
				}
				callRuntimeCallbacks(__ATPOSTRUN__)
			}

			function addOnPreRun(cb) {
				__ATPRERUN__.unshift(cb)
			}

			function addOnInit(cb) {
				__ATINIT__.unshift(cb)
			}

			function addOnPostRun(cb) {
				__ATPOSTRUN__.unshift(cb)
			}
			var runDependencies = 0;
			var runDependencyWatcher = null;
			var dependenciesFulfilled = null;

			function getUniqueRunDependency(id) {
				return id
			}

			function addRunDependency(id) {
				runDependencies++;
				Module["monitorRunDependencies"]?.(runDependencies)
			}

			function removeRunDependency(id) {
				runDependencies--;
				Module["monitorRunDependencies"]?.(runDependencies);
				if (runDependencies == 0) {
					if (runDependencyWatcher !== null) {
						clearInterval(runDependencyWatcher);
						runDependencyWatcher = null
					}
					if (dependenciesFulfilled) {
						var callback = dependenciesFulfilled;
						dependenciesFulfilled = null;
						callback()
					}
				}
			}

			function abort(what) {
				Module["onAbort"]?.(what);
				what = "Aborted(" + what + ")";
				err(what);
				ABORT = true;
				EXITSTATUS = 1;
				what += ". Build with -sASSERTIONS for more info.";
				var e = new WebAssembly.RuntimeError(what);
				readyPromiseReject(e);
				throw e
			}
			var dataURIPrefix = "data:application/octet-stream;base64,";
			var isDataURI = filename => filename.startsWith(dataURIPrefix);
			var isFileURI = filename => filename.startsWith("file://");

			function findWasmBinary() {
				if (Module["locateFile"]) {
					var f = "main.wasm";
					if (!isDataURI(f)) {
						return locateFile(f)
					}
					return f
				}
				return new URL("main.wasm", import.meta.url).href
			}
			var wasmBinaryFile;

			function getBinarySync(file) {
				if (file == wasmBinaryFile && wasmBinary) {
					return new Uint8Array(wasmBinary)
				}
				if (readBinary) {
					return readBinary(file)
				}
				throw "both async and sync fetching of the wasm failed"
			}

			function getBinaryPromise(binaryFile) {
				if (!wasmBinary) {
					return readAsync(binaryFile).then(response => new Uint8Array(response), () => getBinarySync(binaryFile))
				}
				return Promise.resolve().then(() => getBinarySync(binaryFile))
			}

			function instantiateArrayBuffer(binaryFile, imports, receiver) {
				return getBinaryPromise(binaryFile).then(binary => WebAssembly.instantiate(binary, imports)).then(receiver, reason => {
					err(`failed to asynchronously prepare wasm: ${reason}`);
					abort(reason)
				})
			}

			function instantiateAsync(binary, binaryFile, imports, callback) {
				if (!binary && typeof WebAssembly.instantiateStreaming == "function" && !isDataURI(binaryFile) && !isFileURI(binaryFile) && !ENVIRONMENT_IS_NODE && typeof fetch == "function") {
					return fetch(binaryFile, {
						credentials: "same-origin"
					}).then(response => {
						var result = WebAssembly.instantiateStreaming(response, imports);
						return result.then(callback, function(reason) {
							err(`wasm streaming compile failed: ${reason}`);
							err("falling back to ArrayBuffer instantiation");
							return instantiateArrayBuffer(binaryFile, imports, callback)
						})
					})
				}
				return instantiateArrayBuffer(binaryFile, imports, callback)
			}

			function getWasmImports() {
				assignWasmImports();
				return {
					a: wasmImports
				}
			}

			function createWasm() {
				var info = getWasmImports();

				function receiveInstance(instance, module) {
					wasmExports = instance.exports;
					wasmExports = applySignatureConversions(wasmExports);
					registerTLSInit(wasmExports["P"]);
					wasmTable = wasmExports["R"];
					addOnInit(wasmExports["M"]);
					wasmModule = module;
					removeRunDependency("wasm-instantiate");
					return wasmExports
				}
				addRunDependency("wasm-instantiate");

				function receiveInstantiationResult(result) {
					receiveInstance(result["instance"], result["module"])
				}
				if (Module["instantiateWasm"]) {
					try {
						return Module["instantiateWasm"](info, receiveInstance)
					} catch (e) {
						err(`Module.instantiateWasm callback failed with error: ${e}`);
						readyPromiseReject(e)
					}
				}
				if (!wasmBinaryFile) wasmBinaryFile = findWasmBinary();
				instantiateAsync(wasmBinary, wasmBinaryFile, info, receiveInstantiationResult).catch(readyPromiseReject);
				return {}
			}
			var tempDouble;
			var tempI64;

			function ExitStatus(status) {
				this.name = "ExitStatus";
				this.message = `Program terminated with exit(${status})`;
				this.status = status
			}
			Module["ExitStatus"] = ExitStatus;
			var terminateWorker = worker => {
				worker.terminate();
				worker.onmessage = e => {}
			};
			Module["terminateWorker"] = terminateWorker;
			var killThread = pthread_ptr => {
				var worker = PThread.pthreads[pthread_ptr];
				delete PThread.pthreads[pthread_ptr];
				terminateWorker(worker);
				__emscripten_thread_free_data(pthread_ptr);
				PThread.runningWorkers.splice(PThread.runningWorkers.indexOf(worker), 1);
				worker.pthread_ptr = 0
			};
			Module["killThread"] = killThread;
			var cancelThread = pthread_ptr => {
				var worker = PThread.pthreads[pthread_ptr];
				worker.postMessage({
					cmd: "cancel"
				})
			};
			Module["cancelThread"] = cancelThread;
			var cleanupThread = pthread_ptr => {
				var worker = PThread.pthreads[pthread_ptr];
				PThread.returnWorkerToPool(worker)
			};
			Module["cleanupThread"] = cleanupThread;
			var zeroMemory = (address, size) => {
				GROWABLE_HEAP_U8().fill(0, address, address + size);
				return address
			};
			Module["zeroMemory"] = zeroMemory;
			var spawnThread = threadParams => {
				var worker = PThread.getNewWorker();
				if (!worker) {
					return 6
				}
				PThread.runningWorkers.push(worker);
				PThread.pthreads[threadParams.pthread_ptr] = worker;
				worker.pthread_ptr = threadParams.pthread_ptr;
				var msg = {
					cmd: "run",
					start_routine: threadParams.startRoutine,
					arg: threadParams.arg,
					pthread_ptr: threadParams.pthread_ptr
				};
				if (ENVIRONMENT_IS_NODE) {
					worker.unref()
				}
				worker.postMessage(msg, threadParams.transferList);
				return 0
			};
			Module["spawnThread"] = spawnThread;
			var runtimeKeepaliveCounter = 0;
			Module["runtimeKeepaliveCounter"] = runtimeKeepaliveCounter;
			var keepRuntimeAlive = () => noExitRuntime || runtimeKeepaliveCounter > 0;
			Module["keepRuntimeAlive"] = keepRuntimeAlive;
			var stackSave = () => _emscripten_stack_get_current();
			Module["stackSave"] = stackSave;
			var stackRestore = val => __emscripten_stack_restore(val);
			Module["stackRestore"] = stackRestore;
			var stackAlloc = sz => __emscripten_stack_alloc(sz);
			Module["stackAlloc"] = stackAlloc;
			var convertI32PairToI53Checked = (lo, hi) => hi + 2097152 >>> 0 < 4194305 - !!lo ? (lo >>> 0) + hi * 4294967296 : NaN;
			Module["convertI32PairToI53Checked"] = convertI32PairToI53Checked;
			var proxyToMainThread = (funcIndex, emAsmAddr, sync, ...callArgs) => {
				var serializedNumCallArgs = callArgs.length;
				var sp = stackSave();
				var args = stackAlloc(serializedNumCallArgs * 8);
				var b = args >>> 3;
				for (var i = 0; i < callArgs.length; i++) {
					var arg = callArgs[i];
					GROWABLE_HEAP_F64()[b + i >>> 0] = arg
				}
				var rtn = __emscripten_run_on_main_thread_js(funcIndex, emAsmAddr, serializedNumCallArgs, args, sync);
				stackRestore(sp);
				return rtn
			};
			Module["proxyToMainThread"] = proxyToMainThread;

			function _proc_exit(code) {
				if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(0, 0, 1, code);
				EXITSTATUS = code;
				if (!keepRuntimeAlive()) {
					PThread.terminateAllThreads();
					Module["onExit"]?.(code);
					ABORT = true
				}
				quit_(code, new ExitStatus(code))
			}
			Module["_proc_exit"] = _proc_exit;
			var handleException = e => {
				if (e instanceof ExitStatus || e == "unwind") {
					return EXITSTATUS
				}
				quit_(1, e)
			};
			Module["handleException"] = handleException;

			function exitOnMainThread(returnCode) {
				if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(1, 0, 0, returnCode);
				_exit(returnCode)
			}
			Module["exitOnMainThread"] = exitOnMainThread;
			var exitJS = (status, implicit) => {
				EXITSTATUS = status;
				if (ENVIRONMENT_IS_PTHREAD) {
					exitOnMainThread(status);
					throw "unwind"
				}
				_proc_exit(status)
			};
			Module["exitJS"] = exitJS;
			var _exit = exitJS;
			Module["_exit"] = _exit;
			var PThread = {
				unusedWorkers: [],
				runningWorkers: [],
				tlsInitFunctions: [],
				pthreads: {},
				init() {
					if (ENVIRONMENT_IS_PTHREAD) {
						PThread.initWorker()
					} else {
						PThread.initMainThread()
					}
				},
				initMainThread() {
					var pthreadPoolSize = 32;
					while (pthreadPoolSize--) {
						PThread.allocateUnusedWorker()
					}
					addOnPreRun(() => {
						addRunDependency("loading-workers");
						PThread.loadWasmModuleToAllWorkers(() => removeRunDependency("loading-workers"))
					})
				},
				initWorker() {
					noExitRuntime = false
				},
				setExitStatus: status => EXITSTATUS = status,
				terminateAllThreads__deps: ["$terminateWorker"],
				terminateAllThreads: () => {
					for (var worker of PThread.runningWorkers) {
						terminateWorker(worker)
					}
					for (var worker of PThread.unusedWorkers) {
						terminateWorker(worker)
					}
					PThread.unusedWorkers = [];
					PThread.runningWorkers = [];
					PThread.pthreads = []
				},
				returnWorkerToPool: worker => {
					var pthread_ptr = worker.pthread_ptr;
					delete PThread.pthreads[pthread_ptr];
					PThread.unusedWorkers.push(worker);
					PThread.runningWorkers.splice(PThread.runningWorkers.indexOf(worker), 1);
					worker.pthread_ptr = 0;
					__emscripten_thread_free_data(pthread_ptr)
				},
				receiveObjectTransfer(data) {},
				threadInitTLS() {
					PThread.tlsInitFunctions.forEach(f => f())
				},
				loadWasmModuleToWorker: worker => new Promise(onFinishedLoading => {
					worker.onmessage = e => {
						var d = e["data"];
						var cmd = d["cmd"];
						if (d["targetThread"] && d["targetThread"] != _pthread_self()) {
							var targetWorker = PThread.pthreads[d["targetThread"]];
							if (targetWorker) {
								targetWorker.postMessage(d, d["transferList"])
							} else {
								err(`Internal error! Worker sent a message "${cmd}" to target pthread ${d["targetThread"]}, but that thread no longer exists!`)
							}
							return
						}
						if (cmd === "checkMailbox") {
							checkMailbox()
						} else if (cmd === "spawnThread") {
							spawnThread(d)
						} else if (cmd === "cleanupThread") {
							cleanupThread(d["thread"])
						} else if (cmd === "killThread") {
							killThread(d["thread"])
						} else if (cmd === "cancelThread") {
							cancelThread(d["thread"])
						} else if (cmd === "loaded") {
							worker.loaded = true;
							if (ENVIRONMENT_IS_NODE && !worker.pthread_ptr) {
								worker.unref()
							}
							onFinishedLoading(worker)
						} else if (cmd === "alert") {
							alert(`Thread ${d["threadId"]}: ${d["text"]}`)
						} else if (d.target === "setimmediate") {
							worker.postMessage(d)
						} else if (cmd === "callHandler") {
							Module[d["handler"]](...d["args"])
						} else if (cmd) {
							err(`worker sent an unknown command ${cmd}`)
						}
					};
					worker.onerror = e => {
						var message = "worker sent an error!";
						err(`${message} ${e.filename}:${e.lineno}: ${e.message}`);
						throw e
					};
					if (ENVIRONMENT_IS_NODE) {
						worker.on("message", data => worker.onmessage({
							data: data
						}));
						worker.on("error", e => worker.onerror(e))
					}
					var handlers = [];
					var knownHandlers = ["onExit", "onAbort", "print", "printErr"];
					for (var handler of knownHandlers) {
						if (Module.propertyIsEnumerable(handler)) {
							handlers.push(handler)
						}
					}
					worker.postMessage({
						cmd: "load",
						handlers: handlers,
						wasmMemory: wasmMemory,
						wasmModule: wasmModule
					})
				}),
				loadWasmModuleToAllWorkers(onMaybeReady) {
					if (ENVIRONMENT_IS_PTHREAD) {
						return onMaybeReady()
					}
					let pthreadPoolReady = Promise.all(PThread.unusedWorkers.map(PThread.loadWasmModuleToWorker));
					pthreadPoolReady.then(onMaybeReady)
				},
				allocateUnusedWorker() {
					var worker;
					var workerOptions = {
						type: "module",
						workerData: "em-pthread",
						name: "em-pthread"
					};
					worker = new Worker(new URL("main.js", import.meta.url), workerOptions);
					PThread.unusedWorkers.push(worker)
				},
				getNewWorker() {
					if (PThread.unusedWorkers.length == 0) {
						PThread.allocateUnusedWorker();
						PThread.loadWasmModuleToWorker(PThread.unusedWorkers[0])
					}
					return PThread.unusedWorkers.pop()
				}
			};
			Module["PThread"] = PThread;
			var callRuntimeCallbacks = callbacks => {
				while (callbacks.length > 0) {
					callbacks.shift()(Module)
				}
			};
			Module["callRuntimeCallbacks"] = callRuntimeCallbacks;
			var establishStackSpace = () => {
				var pthread_ptr = _pthread_self();
				var stackHigh = GROWABLE_HEAP_U32()[pthread_ptr + 52 >>> 2 >>> 0];
				var stackSize = GROWABLE_HEAP_U32()[pthread_ptr + 56 >>> 2 >>> 0];
				var stackLow = stackHigh - stackSize;
				_emscripten_stack_set_limits(stackHigh, stackLow);
				stackRestore(stackHigh)
			};
			Module["establishStackSpace"] = establishStackSpace;

			function getValue(ptr, type = "i8") {
				if (type.endsWith("*")) type = "*";
				switch (type) {
					case "i1":
						return GROWABLE_HEAP_I8()[ptr >>> 0];
					case "i8":
						return GROWABLE_HEAP_I8()[ptr >>> 0];
					case "i16":
						return GROWABLE_HEAP_I16()[ptr >>> 1 >>> 0];
					case "i32":
						return GROWABLE_HEAP_I32()[ptr >>> 2 >>> 0];
					case "i64":
						abort("to do getValue(i64) use WASM_BIGINT");
					case "float":
						return GROWABLE_HEAP_F32()[ptr >>> 2 >>> 0];
					case "double":
						return GROWABLE_HEAP_F64()[ptr >>> 3 >>> 0];
					case "*":
						return GROWABLE_HEAP_U32()[ptr >>> 2 >>> 0];
					default:
						abort(`invalid type for getValue: ${type}`)
				}
			}
			Module["getValue"] = getValue;
			var wasmTableMirror = [];
			Module["wasmTableMirror"] = wasmTableMirror;
			var wasmTable;
			Module["wasmTable"] = wasmTable;
			var getWasmTableEntry = funcPtr => {
				var func = wasmTableMirror[funcPtr];
				if (!func) {
					if (funcPtr >= wasmTableMirror.length) wasmTableMirror.length = funcPtr + 1;
					wasmTableMirror[funcPtr] = func = wasmTable.get(funcPtr)
				}
				return func
			};
			Module["getWasmTableEntry"] = getWasmTableEntry;
			var invokeEntryPoint = (ptr, arg) => {
				runtimeKeepaliveCounter = 0;
				var result = getWasmTableEntry(ptr)(arg);

				function finish(result) {
					if (keepRuntimeAlive()) {
						PThread.setExitStatus(result)
					} else {
						__emscripten_thread_exit(result)
					}
				}
				finish(result)
			};
			Module["invokeEntryPoint"] = invokeEntryPoint;
			var noExitRuntime = Module["noExitRuntime"] || true;
			Module["noExitRuntime"] = noExitRuntime;
			var registerTLSInit = tlsInitFunc => PThread.tlsInitFunctions.push(tlsInitFunc);
			Module["registerTLSInit"] = registerTLSInit;

			function setValue(ptr, value, type = "i8") {
				if (type.endsWith("*")) type = "*";
				switch (type) {
					case "i1":
						GROWABLE_HEAP_I8()[ptr >>> 0] = value;
						break;
					case "i8":
						GROWABLE_HEAP_I8()[ptr >>> 0] = value;
						break;
					case "i16":
						GROWABLE_HEAP_I16()[ptr >>> 1 >>> 0] = value;
						break;
					case "i32":
						GROWABLE_HEAP_I32()[ptr >>> 2 >>> 0] = value;
						break;
					case "i64":
						abort("to do setValue(i64) use WASM_BIGINT");
					case "float":
						GROWABLE_HEAP_F32()[ptr >>> 2 >>> 0] = value;
						break;
					case "double":
						GROWABLE_HEAP_F64()[ptr >>> 3 >>> 0] = value;
						break;
					case "*":
						GROWABLE_HEAP_U32()[ptr >>> 2 >>> 0] = value;
						break;
					default:
						abort(`invalid type for setValue: ${type}`)
				}
			}
			Module["setValue"] = setValue;

			function ___call_sighandler(fp, sig) {
				fp >>>= 0;
				return getWasmTableEntry(fp)(sig)
			}
			Module["___call_sighandler"] = ___call_sighandler;
			class ExceptionInfo {
				constructor(excPtr) {
					this.excPtr = excPtr;
					this.ptr = excPtr - 24
				}
				set_type(type) {
					GROWABLE_HEAP_U32()[this.ptr + 4 >>> 2 >>> 0] = type
				}
				get_type() {
					return GROWABLE_HEAP_U32()[this.ptr + 4 >>> 2 >>> 0]
				}
				set_destructor(destructor) {
					GROWABLE_HEAP_U32()[this.ptr + 8 >>> 2 >>> 0] = destructor
				}
				get_destructor() {
					return GROWABLE_HEAP_U32()[this.ptr + 8 >>> 2 >>> 0]
				}
				set_caught(caught) {
					caught = caught ? 1 : 0;
					GROWABLE_HEAP_I8()[this.ptr + 12 >>> 0] = caught
				}
				get_caught() {
					return GROWABLE_HEAP_I8()[this.ptr + 12 >>> 0] != 0
				}
				set_rethrown(rethrown) {
					rethrown = rethrown ? 1 : 0;
					GROWABLE_HEAP_I8()[this.ptr + 13 >>> 0] = rethrown
				}
				get_rethrown() {
					return GROWABLE_HEAP_I8()[this.ptr + 13 >>> 0] != 0
				}
				init(type, destructor) {
					this.set_adjusted_ptr(0);
					this.set_type(type);
					this.set_destructor(destructor)
				}
				set_adjusted_ptr(adjustedPtr) {
					GROWABLE_HEAP_U32()[this.ptr + 16 >>> 2 >>> 0] = adjustedPtr
				}
				get_adjusted_ptr() {
					return GROWABLE_HEAP_U32()[this.ptr + 16 >>> 2 >>> 0]
				}
			}
			Module["ExceptionInfo"] = ExceptionInfo;
			var exceptionLast = 0;
			Module["exceptionLast"] = exceptionLast;
			var uncaughtExceptionCount = 0;
			Module["uncaughtExceptionCount"] = uncaughtExceptionCount;

			function ___cxa_throw(ptr, type, destructor) {
				ptr >>>= 0;
				type >>>= 0;
				destructor >>>= 0;
				var info = new ExceptionInfo(ptr);
				info.init(type, destructor);
				exceptionLast = ptr;
				uncaughtExceptionCount++;
				throw exceptionLast
			}
			Module["___cxa_throw"] = ___cxa_throw;

			function pthreadCreateProxied(pthread_ptr, attr, startRoutine, arg) {
				if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(2, 0, 1, pthread_ptr, attr, startRoutine, arg);
				return ___pthread_create_js(pthread_ptr, attr, startRoutine, arg)
			}
			Module["pthreadCreateProxied"] = pthreadCreateProxied;

			function ___pthread_create_js(pthread_ptr, attr, startRoutine, arg) {
				pthread_ptr >>>= 0;
				attr >>>= 0;
				startRoutine >>>= 0;
				arg >>>= 0;
				if (typeof SharedArrayBuffer == "undefined") {
					err("Current environment does not support SharedArrayBuffer, pthreads are not available!");
					return 6
				}
				var transferList = [];
				var error = 0;
				if (ENVIRONMENT_IS_PTHREAD && (transferList.length === 0 || error)) {
					return pthreadCreateProxied(pthread_ptr, attr, startRoutine, arg)
				}
				if (error) return error;
				var threadParams = {
					startRoutine: startRoutine,
					pthread_ptr: pthread_ptr,
					arg: arg,
					transferList: transferList
				};
				if (ENVIRONMENT_IS_PTHREAD) {
					threadParams.cmd = "spawnThread";
					postMessage(threadParams, transferList);
					return 0
				}
				return spawnThread(threadParams)
			}
			Module["___pthread_create_js"] = ___pthread_create_js;

			function syscallGetVarargI() {
				var ret = GROWABLE_HEAP_I32()[+SYSCALLS.varargs >>> 2 >>> 0];
				SYSCALLS.varargs += 4;
				return ret
			}
			Module["syscallGetVarargI"] = syscallGetVarargI;
			var syscallGetVarargP = syscallGetVarargI;
			Module["syscallGetVarargP"] = syscallGetVarargP;
			var PATH = {
				isAbs: path => path.charAt(0) === "/",
				splitPath: filename => {
					var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
					return splitPathRe.exec(filename).slice(1)
				},
				normalizeArray: (parts, allowAboveRoot) => {
					var up = 0;
					for (var i = parts.length - 1; i >= 0; i--) {
						var last = parts[i];
						if (last === ".") {
							parts.splice(i, 1)
						} else if (last === "..") {
							parts.splice(i, 1);
							up++
						} else if (up) {
							parts.splice(i, 1);
							up--
						}
					}
					if (allowAboveRoot) {
						for (; up; up--) {
							parts.unshift("..")
						}
					}
					return parts
				},
				normalize: path => {
					var isAbsolute = PATH.isAbs(path),
						trailingSlash = path.substr(-1) === "/";
					path = PATH.normalizeArray(path.split("/").filter(p => !!p), !isAbsolute).join("/");
					if (!path && !isAbsolute) {
						path = "."
					}
					if (path && trailingSlash) {
						path += "/"
					}
					return (isAbsolute ? "/" : "") + path
				},
				dirname: path => {
					var result = PATH.splitPath(path),
						root = result[0],
						dir = result[1];
					if (!root && !dir) {
						return "."
					}
					if (dir) {
						dir = dir.substr(0, dir.length - 1)
					}
					return root + dir
				},
				basename: path => {
					if (path === "/") return "/";
					path = PATH.normalize(path);
					path = path.replace(/\/$/, "");
					var lastSlash = path.lastIndexOf("/");
					if (lastSlash === -1) return path;
					return path.substr(lastSlash + 1)
				},
				join: (...paths) => PATH.normalize(paths.join("/")),
				join2: (l, r) => PATH.normalize(l + "/" + r)
			};
			Module["PATH"] = PATH;
			var initRandomFill = () => {
				if (typeof crypto == "object" && typeof crypto["getRandomValues"] == "function") {
					return view => (view.set(crypto.getRandomValues(new Uint8Array(view.byteLength))), view)
				} else if (ENVIRONMENT_IS_NODE) {
					try {
						var crypto_module = require("crypto");
						var randomFillSync = crypto_module["randomFillSync"];
						if (randomFillSync) {
							return view => crypto_module["randomFillSync"](view)
						}
						var randomBytes = crypto_module["randomBytes"];
						return view => (view.set(randomBytes(view.byteLength)), view)
					} catch (e) {}
				}
				abort("initRandomDevice")
			};
			Module["initRandomFill"] = initRandomFill;
			var randomFill = view => (randomFill = initRandomFill())(view);
			Module["randomFill"] = randomFill;
			var PATH_FS = {
				resolve: (...args) => {
					var resolvedPath = "",
						resolvedAbsolute = false;
					for (var i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
						var path = i >= 0 ? args[i] : FS.cwd();
						if (typeof path != "string") {
							throw new TypeError("Arguments to path.resolve must be strings")
						} else if (!path) {
							return ""
						}
						resolvedPath = path + "/" + resolvedPath;
						resolvedAbsolute = PATH.isAbs(path)
					}
					resolvedPath = PATH.normalizeArray(resolvedPath.split("/").filter(p => !!p), !resolvedAbsolute).join("/");
					return (resolvedAbsolute ? "/" : "") + resolvedPath || "."
				},
				relative: (from, to) => {
					from = PATH_FS.resolve(from).substr(1);
					to = PATH_FS.resolve(to).substr(1);

					function trim(arr) {
						var start = 0;
						for (; start < arr.length; start++) {
							if (arr[start] !== "") break
						}
						var end = arr.length - 1;
						for (; end >= 0; end--) {
							if (arr[end] !== "") break
						}
						if (start > end) return [];
						return arr.slice(start, end - start + 1)
					}
					var fromParts = trim(from.split("/"));
					var toParts = trim(to.split("/"));
					var length = Math.min(fromParts.length, toParts.length);
					var samePartsLength = length;
					for (var i = 0; i < length; i++) {
						if (fromParts[i] !== toParts[i]) {
							samePartsLength = i;
							break
						}
					}
					var outputParts = [];
					for (var i = samePartsLength; i < fromParts.length; i++) {
						outputParts.push("..")
					}
					outputParts = outputParts.concat(toParts.slice(samePartsLength));
					return outputParts.join("/")
				}
			};
			Module["PATH_FS"] = PATH_FS;
			var UTF8Decoder = typeof TextDecoder != "undefined" ? new TextDecoder : undefined;
			Module["UTF8Decoder"] = UTF8Decoder;
			var UTF8ArrayToString = (heapOrArray, idx, maxBytesToRead) => {
				idx >>>= 0;
				var endIdx = idx + maxBytesToRead;
				var endPtr = idx;
				while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;
				if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
					return UTF8Decoder.decode(heapOrArray.buffer instanceof SharedArrayBuffer ? heapOrArray.slice(idx, endPtr) : heapOrArray.subarray(idx, endPtr))
				}
				var str = "";
				while (idx < endPtr) {
					var u0 = heapOrArray[idx++];
					if (!(u0 & 128)) {
						str += String.fromCharCode(u0);
						continue
					}
					var u1 = heapOrArray[idx++] & 63;
					if ((u0 & 224) == 192) {
						str += String.fromCharCode((u0 & 31) << 6 | u1);
						continue
					}
					var u2 = heapOrArray[idx++] & 63;
					if ((u0 & 240) == 224) {
						u0 = (u0 & 15) << 12 | u1 << 6 | u2
					} else {
						u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | heapOrArray[idx++] & 63
					}
					if (u0 < 65536) {
						str += String.fromCharCode(u0)
					} else {
						var ch = u0 - 65536;
						str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023)
					}
				}
				return str
			};
			Module["UTF8ArrayToString"] = UTF8ArrayToString;
			var FS_stdin_getChar_buffer = [];
			Module["FS_stdin_getChar_buffer"] = FS_stdin_getChar_buffer;
			var lengthBytesUTF8 = str => {
				var len = 0;
				for (var i = 0; i < str.length; ++i) {
					var c = str.charCodeAt(i);
					if (c <= 127) {
						len++
					} else if (c <= 2047) {
						len += 2
					} else if (c >= 55296 && c <= 57343) {
						len += 4;
						++i
					} else {
						len += 3
					}
				}
				return len
			};
			Module["lengthBytesUTF8"] = lengthBytesUTF8;
			var stringToUTF8Array = (str, heap, outIdx, maxBytesToWrite) => {
				outIdx >>>= 0;
				if (!(maxBytesToWrite > 0)) return 0;
				var startIdx = outIdx;
				var endIdx = outIdx + maxBytesToWrite - 1;
				for (var i = 0; i < str.length; ++i) {
					var u = str.charCodeAt(i);
					if (u >= 55296 && u <= 57343) {
						var u1 = str.charCodeAt(++i);
						u = 65536 + ((u & 1023) << 10) | u1 & 1023
					}
					if (u <= 127) {
						if (outIdx >= endIdx) break;
						heap[outIdx++ >>> 0] = u
					} else if (u <= 2047) {
						if (outIdx + 1 >= endIdx) break;
						heap[outIdx++ >>> 0] = 192 | u >> 6;
						heap[outIdx++ >>> 0] = 128 | u & 63
					} else if (u <= 65535) {
						if (outIdx + 2 >= endIdx) break;
						heap[outIdx++ >>> 0] = 224 | u >> 12;
						heap[outIdx++ >>> 0] = 128 | u >> 6 & 63;
						heap[outIdx++ >>> 0] = 128 | u & 63
					} else {
						if (outIdx + 3 >= endIdx) break;
						heap[outIdx++ >>> 0] = 240 | u >> 18;
						heap[outIdx++ >>> 0] = 128 | u >> 12 & 63;
						heap[outIdx++ >>> 0] = 128 | u >> 6 & 63;
						heap[outIdx++ >>> 0] = 128 | u & 63
					}
				}
				heap[outIdx >>> 0] = 0;
				return outIdx - startIdx
			};
			Module["stringToUTF8Array"] = stringToUTF8Array;

			function intArrayFromString(stringy, dontAddNull, length) {
				var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
				var u8array = new Array(len);
				var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
				if (dontAddNull) u8array.length = numBytesWritten;
				return u8array
			}
			Module["intArrayFromString"] = intArrayFromString;
			var FS_stdin_getChar = () => {
				if (!FS_stdin_getChar_buffer.length) {
					var result = null;
					if (ENVIRONMENT_IS_NODE) {
						var BUFSIZE = 256;
						var buf = Buffer.alloc(BUFSIZE);
						var bytesRead = 0;
						var fd = process.stdin.fd;
						try {
							bytesRead = fs.readSync(fd, buf, 0, BUFSIZE)
						} catch (e) {
							if (e.toString().includes("EOF")) bytesRead = 0;
							else throw e
						}
						if (bytesRead > 0) {
							result = buf.slice(0, bytesRead).toString("utf-8")
						}
					} else if (typeof window != "undefined" && typeof window.prompt == "function") {
						result = window.prompt("Input: ");
						if (result !== null) {
							result += "\n"
						}
					} else {}
					if (!result) {
						return null
					}
					FS_stdin_getChar_buffer = intArrayFromString(result, true)
				}
				return FS_stdin_getChar_buffer.shift()
			};
			Module["FS_stdin_getChar"] = FS_stdin_getChar;
			var TTY = {
				ttys: [],
				init() {},
				shutdown() {},
				register(dev, ops) {
					TTY.ttys[dev] = {
						input: [],
						output: [],
						ops: ops
					};
					FS.registerDevice(dev, TTY.stream_ops)
				},
				stream_ops: {
					open(stream) {
						var tty = TTY.ttys[stream.node.rdev];
						if (!tty) {
							throw new FS.ErrnoError(43)
						}
						stream.tty = tty;
						stream.seekable = false
					},
					close(stream) {
						stream.tty.ops.fsync(stream.tty)
					},
					fsync(stream) {
						stream.tty.ops.fsync(stream.tty)
					},
					read(stream, buffer, offset, length, pos) {
						if (!stream.tty || !stream.tty.ops.get_char) {
							throw new FS.ErrnoError(60)
						}
						var bytesRead = 0;
						for (var i = 0; i < length; i++) {
							var result;
							try {
								result = stream.tty.ops.get_char(stream.tty)
							} catch (e) {
								throw new FS.ErrnoError(29)
							}
							if (result === undefined && bytesRead === 0) {
								throw new FS.ErrnoError(6)
							}
							if (result === null || result === undefined) break;
							bytesRead++;
							buffer[offset + i] = result
						}
						if (bytesRead) {
							stream.node.timestamp = Date.now()
						}
						return bytesRead
					},
					write(stream, buffer, offset, length, pos) {
						if (!stream.tty || !stream.tty.ops.put_char) {
							throw new FS.ErrnoError(60)
						}
						try {
							for (var i = 0; i < length; i++) {
								stream.tty.ops.put_char(stream.tty, buffer[offset + i])
							}
						} catch (e) {
							throw new FS.ErrnoError(29)
						}
						if (length) {
							stream.node.timestamp = Date.now()
						}
						return i
					}
				},
				default_tty_ops: {
					get_char(tty) {
						return FS_stdin_getChar()
					},
					put_char(tty, val) {
						if (val === null || val === 10) {
							out(UTF8ArrayToString(tty.output, 0));
							tty.output = []
						} else {
							if (val != 0) tty.output.push(val)
						}
					},
					fsync(tty) {
						if (tty.output && tty.output.length > 0) {
							out(UTF8ArrayToString(tty.output, 0));
							tty.output = []
						}
					},
					ioctl_tcgets(tty) {
						return {
							c_iflag: 25856,
							c_oflag: 5,
							c_cflag: 191,
							c_lflag: 35387,
							c_cc: [3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
						}
					},
					ioctl_tcsets(tty, optional_actions, data) {
						return 0
					},
					ioctl_tiocgwinsz(tty) {
						return [24, 80]
					}
				},
				default_tty1_ops: {
					put_char(tty, val) {
						if (val === null || val === 10) {
							err(UTF8ArrayToString(tty.output, 0));
							tty.output = []
						} else {
							if (val != 0) tty.output.push(val)
						}
					},
					fsync(tty) {
						if (tty.output && tty.output.length > 0) {
							err(UTF8ArrayToString(tty.output, 0));
							tty.output = []
						}
					}
				}
			};
			Module["TTY"] = TTY;
			var alignMemory = (size, alignment) => Math.ceil(size / alignment) * alignment;
			Module["alignMemory"] = alignMemory;
			var mmapAlloc = size => {
				size = alignMemory(size, 65536);
				var ptr = _emscripten_builtin_memalign(65536, size);
				if (!ptr) return 0;
				return zeroMemory(ptr, size)
			};
			Module["mmapAlloc"] = mmapAlloc;
			var MEMFS = {
				ops_table: null,
				mount(mount) {
					return MEMFS.createNode(null, "/", 16384 | 511, 0)
				},
				createNode(parent, name, mode, dev) {
					if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
						throw new FS.ErrnoError(63)
					}
					MEMFS.ops_table ||= {
						dir: {
							node: {
								getattr: MEMFS.node_ops.getattr,
								setattr: MEMFS.node_ops.setattr,
								lookup: MEMFS.node_ops.lookup,
								mknod: MEMFS.node_ops.mknod,
								rename: MEMFS.node_ops.rename,
								unlink: MEMFS.node_ops.unlink,
								rmdir: MEMFS.node_ops.rmdir,
								readdir: MEMFS.node_ops.readdir,
								symlink: MEMFS.node_ops.symlink
							},
							stream: {
								llseek: MEMFS.stream_ops.llseek
							}
						},
						file: {
							node: {
								getattr: MEMFS.node_ops.getattr,
								setattr: MEMFS.node_ops.setattr
							},
							stream: {
								llseek: MEMFS.stream_ops.llseek,
								read: MEMFS.stream_ops.read,
								write: MEMFS.stream_ops.write,
								allocate: MEMFS.stream_ops.allocate,
								mmap: MEMFS.stream_ops.mmap,
								msync: MEMFS.stream_ops.msync
							}
						},
						link: {
							node: {
								getattr: MEMFS.node_ops.getattr,
								setattr: MEMFS.node_ops.setattr,
								readlink: MEMFS.node_ops.readlink
							},
							stream: {}
						},
						chrdev: {
							node: {
								getattr: MEMFS.node_ops.getattr,
								setattr: MEMFS.node_ops.setattr
							},
							stream: FS.chrdev_stream_ops
						}
					};
					var node = FS.createNode(parent, name, mode, dev);
					if (FS.isDir(node.mode)) {
						node.node_ops = MEMFS.ops_table.dir.node;
						node.stream_ops = MEMFS.ops_table.dir.stream;
						node.contents = {}
					} else if (FS.isFile(node.mode)) {
						node.node_ops = MEMFS.ops_table.file.node;
						node.stream_ops = MEMFS.ops_table.file.stream;
						node.usedBytes = 0;
						node.contents = null
					} else if (FS.isLink(node.mode)) {
						node.node_ops = MEMFS.ops_table.link.node;
						node.stream_ops = MEMFS.ops_table.link.stream
					} else if (FS.isChrdev(node.mode)) {
						node.node_ops = MEMFS.ops_table.chrdev.node;
						node.stream_ops = MEMFS.ops_table.chrdev.stream
					}
					node.timestamp = Date.now();
					if (parent) {
						parent.contents[name] = node;
						parent.timestamp = node.timestamp
					}
					return node
				},
				getFileDataAsTypedArray(node) {
					if (!node.contents) return new Uint8Array(0);
					if (node.contents.subarray) return node.contents.subarray(0, node.usedBytes);
					return new Uint8Array(node.contents)
				},
				expandFileStorage(node, newCapacity) {
					var prevCapacity = node.contents ? node.contents.length : 0;
					if (prevCapacity >= newCapacity) return;
					var CAPACITY_DOUBLING_MAX = 1024 * 1024;
					newCapacity = Math.max(newCapacity, prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125) >>> 0);
					if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256);
					var oldContents = node.contents;
					node.contents = new Uint8Array(newCapacity);
					if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0)
				},
				resizeFileStorage(node, newSize) {
					if (node.usedBytes == newSize) return;
					if (newSize == 0) {
						node.contents = null;
						node.usedBytes = 0
					} else {
						var oldContents = node.contents;
						node.contents = new Uint8Array(newSize);
						if (oldContents) {
							node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes)))
						}
						node.usedBytes = newSize
					}
				},
				node_ops: {
					getattr(node) {
						var attr = {};
						attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
						attr.ino = node.id;
						attr.mode = node.mode;
						attr.nlink = 1;
						attr.uid = 0;
						attr.gid = 0;
						attr.rdev = node.rdev;
						if (FS.isDir(node.mode)) {
							attr.size = 4096
						} else if (FS.isFile(node.mode)) {
							attr.size = node.usedBytes
						} else if (FS.isLink(node.mode)) {
							attr.size = node.link.length
						} else {
							attr.size = 0
						}
						attr.atime = new Date(node.timestamp);
						attr.mtime = new Date(node.timestamp);
						attr.ctime = new Date(node.timestamp);
						attr.blksize = 4096;
						attr.blocks = Math.ceil(attr.size / attr.blksize);
						return attr
					},
					setattr(node, attr) {
						if (attr.mode !== undefined) {
							node.mode = attr.mode
						}
						if (attr.timestamp !== undefined) {
							node.timestamp = attr.timestamp
						}
						if (attr.size !== undefined) {
							MEMFS.resizeFileStorage(node, attr.size)
						}
					},
					lookup(parent, name) {
						throw FS.genericErrors[44]
					},
					mknod(parent, name, mode, dev) {
						return MEMFS.createNode(parent, name, mode, dev)
					},
					rename(old_node, new_dir, new_name) {
						if (FS.isDir(old_node.mode)) {
							var new_node;
							try {
								new_node = FS.lookupNode(new_dir, new_name)
							} catch (e) {}
							if (new_node) {
								for (var i in new_node.contents) {
									throw new FS.ErrnoError(55)
								}
							}
						}
						delete old_node.parent.contents[old_node.name];
						old_node.parent.timestamp = Date.now();
						old_node.name = new_name;
						new_dir.contents[new_name] = old_node;
						new_dir.timestamp = old_node.parent.timestamp
					},
					unlink(parent, name) {
						delete parent.contents[name];
						parent.timestamp = Date.now()
					},
					rmdir(parent, name) {
						var node = FS.lookupNode(parent, name);
						for (var i in node.contents) {
							throw new FS.ErrnoError(55)
						}
						delete parent.contents[name];
						parent.timestamp = Date.now()
					},
					readdir(node) {
						var entries = [".", ".."];
						for (var key of Object.keys(node.contents)) {
							entries.push(key)
						}
						return entries
					},
					symlink(parent, newname, oldpath) {
						var node = MEMFS.createNode(parent, newname, 511 | 40960, 0);
						node.link = oldpath;
						return node
					},
					readlink(node) {
						if (!FS.isLink(node.mode)) {
							throw new FS.ErrnoError(28)
						}
						return node.link
					}
				},
				stream_ops: {
					read(stream, buffer, offset, length, position) {
						var contents = stream.node.contents;
						if (position >= stream.node.usedBytes) return 0;
						var size = Math.min(stream.node.usedBytes - position, length);
						if (size > 8 && contents.subarray) {
							buffer.set(contents.subarray(position, position + size), offset)
						} else {
							for (var i = 0; i < size; i++) buffer[offset + i] = contents[position + i]
						}
						return size
					},
					write(stream, buffer, offset, length, position, canOwn) {
						if (buffer.buffer === GROWABLE_HEAP_I8().buffer) {
							canOwn = false
						}
						if (!length) return 0;
						var node = stream.node;
						node.timestamp = Date.now();
						if (buffer.subarray && (!node.contents || node.contents.subarray)) {
							if (canOwn) {
								node.contents = buffer.subarray(offset, offset + length);
								node.usedBytes = length;
								return length
							} else if (node.usedBytes === 0 && position === 0) {
								node.contents = buffer.slice(offset, offset + length);
								node.usedBytes = length;
								return length
							} else if (position + length <= node.usedBytes) {
								node.contents.set(buffer.subarray(offset, offset + length), position);
								return length
							}
						}
						MEMFS.expandFileStorage(node, position + length);
						if (node.contents.subarray && buffer.subarray) {
							node.contents.set(buffer.subarray(offset, offset + length), position)
						} else {
							for (var i = 0; i < length; i++) {
								node.contents[position + i] = buffer[offset + i]
							}
						}
						node.usedBytes = Math.max(node.usedBytes, position + length);
						return length
					},
					llseek(stream, offset, whence) {
						var position = offset;
						if (whence === 1) {
							position += stream.position
						} else if (whence === 2) {
							if (FS.isFile(stream.node.mode)) {
								position += stream.node.usedBytes
							}
						}
						if (position < 0) {
							throw new FS.ErrnoError(28)
						}
						return position
					},
					allocate(stream, offset, length) {
						MEMFS.expandFileStorage(stream.node, offset + length);
						stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length)
					},
					mmap(stream, length, position, prot, flags) {
						if (!FS.isFile(stream.node.mode)) {
							throw new FS.ErrnoError(43)
						}
						var ptr;
						var allocated;
						var contents = stream.node.contents;
						if (!(flags & 2) && contents && contents.buffer === GROWABLE_HEAP_I8().buffer) {
							allocated = false;
							ptr = contents.byteOffset
						} else {
							allocated = true;
							ptr = mmapAlloc(length);
							if (!ptr) {
								throw new FS.ErrnoError(48)
							}
							if (contents) {
								if (position > 0 || position + length < contents.length) {
									if (contents.subarray) {
										contents = contents.subarray(position, position + length)
									} else {
										contents = Array.prototype.slice.call(contents, position, position + length)
									}
								}
								GROWABLE_HEAP_I8().set(contents, ptr >>> 0)
							}
						}
						return {
							ptr: ptr,
							allocated: allocated
						}
					},
					msync(stream, buffer, offset, length, mmapFlags) {
						MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
						return 0
					}
				}
			};
			Module["MEMFS"] = MEMFS;
			var asyncLoad = (url, onload, onerror, noRunDep) => {
				var dep = !noRunDep ? getUniqueRunDependency(`al ${url}`) : "";
				readAsync(url).then(arrayBuffer => {
					onload(new Uint8Array(arrayBuffer));
					if (dep) removeRunDependency(dep)
				}, err => {
					if (onerror) {
						onerror()
					} else {
						throw `Loading data file "${url}" failed.`
					}
				});
				if (dep) addRunDependency(dep)
			};
			Module["asyncLoad"] = asyncLoad;
			var FS_createDataFile = (parent, name, fileData, canRead, canWrite, canOwn) => {
				FS.createDataFile(parent, name, fileData, canRead, canWrite, canOwn)
			};
			Module["FS_createDataFile"] = FS_createDataFile;
			var preloadPlugins = Module["preloadPlugins"] || [];
			Module["preloadPlugins"] = preloadPlugins;
			var FS_handledByPreloadPlugin = (byteArray, fullname, finish, onerror) => {
				if (typeof Browser != "undefined") Browser.init();
				var handled = false;
				preloadPlugins.forEach(plugin => {
					if (handled) return;
					if (plugin["canHandle"](fullname)) {
						plugin["handle"](byteArray, fullname, finish, onerror);
						handled = true
					}
				});
				return handled
			};
			Module["FS_handledByPreloadPlugin"] = FS_handledByPreloadPlugin;
			var FS_createPreloadedFile = (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) => {
				var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent;
				var dep = getUniqueRunDependency(`cp ${fullname}`);

				function processData(byteArray) {
					function finish(byteArray) {
						preFinish?.();
						if (!dontCreateFile) {
							FS_createDataFile(parent, name, byteArray, canRead, canWrite, canOwn)
						}
						onload?.();
						removeRunDependency(dep)
					}
					if (FS_handledByPreloadPlugin(byteArray, fullname, finish, () => {
							onerror?.();
							removeRunDependency(dep)
						})) {
						return
					}
					finish(byteArray)
				}
				addRunDependency(dep);
				if (typeof url == "string") {
					asyncLoad(url, processData, onerror)
				} else {
					processData(url)
				}
			};
			Module["FS_createPreloadedFile"] = FS_createPreloadedFile;
			var FS_modeStringToFlags = str => {
				var flagModes = {
					r: 0,
					"r+": 2,
					w: 512 | 64 | 1,
					"w+": 512 | 64 | 2,
					a: 1024 | 64 | 1,
					"a+": 1024 | 64 | 2
				};
				var flags = flagModes[str];
				if (typeof flags == "undefined") {
					throw new Error(`Unknown file open mode: ${str}`)
				}
				return flags
			};
			Module["FS_modeStringToFlags"] = FS_modeStringToFlags;
			var FS_getMode = (canRead, canWrite) => {
				var mode = 0;
				if (canRead) mode |= 292 | 73;
				if (canWrite) mode |= 146;
				return mode
			};
			Module["FS_getMode"] = FS_getMode;
			var FS = {
				root: null,
				mounts: [],
				devices: {},
				streams: [],
				nextInode: 1,
				nameTable: null,
				currentPath: "/",
				initialized: false,
				ignorePermissions: true,
				ErrnoError: class {
					constructor(errno) {
						this.name = "ErrnoError";
						this.errno = errno
					}
				},
				genericErrors: {},
				filesystems: null,
				syncFSRequests: 0,
				FSStream: class {
					constructor() {
						this.shared = {}
					}
					get object() {
						return this.node
					}
					set object(val) {
						this.node = val
					}
					get isRead() {
						return (this.flags & 2097155) !== 1
					}
					get isWrite() {
						return (this.flags & 2097155) !== 0
					}
					get isAppend() {
						return this.flags & 1024
					}
					get flags() {
						return this.shared.flags
					}
					set flags(val) {
						this.shared.flags = val
					}
					get position() {
						return this.shared.position
					}
					set position(val) {
						this.shared.position = val
					}
				},
				FSNode: class {
					constructor(parent, name, mode, rdev) {
						if (!parent) {
							parent = this
						}
						this.parent = parent;
						this.mount = parent.mount;
						this.mounted = null;
						this.id = FS.nextInode++;
						this.name = name;
						this.mode = mode;
						this.node_ops = {};
						this.stream_ops = {};
						this.rdev = rdev;
						this.readMode = 292 | 73;
						this.writeMode = 146
					}
					get read() {
						return (this.mode & this.readMode) === this.readMode
					}
					set read(val) {
						val ? this.mode |= this.readMode : this.mode &= ~this.readMode
					}
					get write() {
						return (this.mode & this.writeMode) === this.writeMode
					}
					set write(val) {
						val ? this.mode |= this.writeMode : this.mode &= ~this.writeMode
					}
					get isFolder() {
						return FS.isDir(this.mode)
					}
					get isDevice() {
						return FS.isChrdev(this.mode)
					}
				},
				lookupPath(path, opts = {}) {
					path = PATH_FS.resolve(path);
					if (!path) return {
						path: "",
						node: null
					};
					var defaults = {
						follow_mount: true,
						recurse_count: 0
					};
					opts = Object.assign(defaults, opts);
					if (opts.recurse_count > 8) {
						throw new FS.ErrnoError(32)
					}
					var parts = path.split("/").filter(p => !!p);
					var current = FS.root;
					var current_path = "/";
					for (var i = 0; i < parts.length; i++) {
						var islast = i === parts.length - 1;
						if (islast && opts.parent) {
							break
						}
						current = FS.lookupNode(current, parts[i]);
						current_path = PATH.join2(current_path, parts[i]);
						if (FS.isMountpoint(current)) {
							if (!islast || islast && opts.follow_mount) {
								current = current.mounted.root
							}
						}
						if (!islast || opts.follow) {
							var count = 0;
							while (FS.isLink(current.mode)) {
								var link = FS.readlink(current_path);
								current_path = PATH_FS.resolve(PATH.dirname(current_path), link);
								var lookup = FS.lookupPath(current_path, {
									recurse_count: opts.recurse_count + 1
								});
								current = lookup.node;
								if (count++ > 40) {
									throw new FS.ErrnoError(32)
								}
							}
						}
					}
					return {
						path: current_path,
						node: current
					}
				},
				getPath(node) {
					var path;
					while (true) {
						if (FS.isRoot(node)) {
							var mount = node.mount.mountpoint;
							if (!path) return mount;
							return mount[mount.length - 1] !== "/" ? `${mount}/${path}` : mount + path
						}
						path = path ? `${node.name}/${path}` : node.name;
						node = node.parent
					}
				},
				hashName(parentid, name) {
					var hash = 0;
					for (var i = 0; i < name.length; i++) {
						hash = (hash << 5) - hash + name.charCodeAt(i) | 0
					}
					return (parentid + hash >>> 0) % FS.nameTable.length
				},
				hashAddNode(node) {
					var hash = FS.hashName(node.parent.id, node.name);
					node.name_next = FS.nameTable[hash];
					FS.nameTable[hash] = node
				},
				hashRemoveNode(node) {
					var hash = FS.hashName(node.parent.id, node.name);
					if (FS.nameTable[hash] === node) {
						FS.nameTable[hash] = node.name_next
					} else {
						var current = FS.nameTable[hash];
						while (current) {
							if (current.name_next === node) {
								current.name_next = node.name_next;
								break
							}
							current = current.name_next
						}
					}
				},
				lookupNode(parent, name) {
					var errCode = FS.mayLookup(parent);
					if (errCode) {
						throw new FS.ErrnoError(errCode)
					}
					var hash = FS.hashName(parent.id, name);
					for (var node = FS.nameTable[hash]; node; node = node.name_next) {
						var nodeName = node.name;
						if (node.parent.id === parent.id && nodeName === name) {
							return node
						}
					}
					return FS.lookup(parent, name)
				},
				createNode(parent, name, mode, rdev) {
					var node = new FS.FSNode(parent, name, mode, rdev);
					FS.hashAddNode(node);
					return node
				},
				destroyNode(node) {
					FS.hashRemoveNode(node)
				},
				isRoot(node) {
					return node === node.parent
				},
				isMountpoint(node) {
					return !!node.mounted
				},
				isFile(mode) {
					return (mode & 61440) === 32768
				},
				isDir(mode) {
					return (mode & 61440) === 16384
				},
				isLink(mode) {
					return (mode & 61440) === 40960
				},
				isChrdev(mode) {
					return (mode & 61440) === 8192
				},
				isBlkdev(mode) {
					return (mode & 61440) === 24576
				},
				isFIFO(mode) {
					return (mode & 61440) === 4096
				},
				isSocket(mode) {
					return (mode & 49152) === 49152
				},
				flagsToPermissionString(flag) {
					var perms = ["r", "w", "rw"][flag & 3];
					if (flag & 512) {
						perms += "w"
					}
					return perms
				},
				nodePermissions(node, perms) {
					if (FS.ignorePermissions) {
						return 0
					}
					if (perms.includes("r") && !(node.mode & 292)) {
						return 2
					} else if (perms.includes("w") && !(node.mode & 146)) {
						return 2
					} else if (perms.includes("x") && !(node.mode & 73)) {
						return 2
					}
					return 0
				},
				mayLookup(dir) {
					if (!FS.isDir(dir.mode)) return 54;
					var errCode = FS.nodePermissions(dir, "x");
					if (errCode) return errCode;
					if (!dir.node_ops.lookup) return 2;
					return 0
				},
				mayCreate(dir, name) {
					try {
						var node = FS.lookupNode(dir, name);
						return 20
					} catch (e) {}
					return FS.nodePermissions(dir, "wx")
				},
				mayDelete(dir, name, isdir) {
					var node;
					try {
						node = FS.lookupNode(dir, name)
					} catch (e) {
						return e.errno
					}
					var errCode = FS.nodePermissions(dir, "wx");
					if (errCode) {
						return errCode
					}
					if (isdir) {
						if (!FS.isDir(node.mode)) {
							return 54
						}
						if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
							return 10
						}
					} else {
						if (FS.isDir(node.mode)) {
							return 31
						}
					}
					return 0
				},
				mayOpen(node, flags) {
					if (!node) {
						return 44
					}
					if (FS.isLink(node.mode)) {
						return 32
					} else if (FS.isDir(node.mode)) {
						if (FS.flagsToPermissionString(flags) !== "r" || flags & 512) {
							return 31
						}
					}
					return FS.nodePermissions(node, FS.flagsToPermissionString(flags))
				},
				MAX_OPEN_FDS: 4096,
				nextfd() {
					for (var fd = 0; fd <= FS.MAX_OPEN_FDS; fd++) {
						if (!FS.streams[fd]) {
							return fd
						}
					}
					throw new FS.ErrnoError(33)
				},
				getStreamChecked(fd) {
					var stream = FS.getStream(fd);
					if (!stream) {
						throw new FS.ErrnoError(8)
					}
					return stream
				},
				getStream: fd => FS.streams[fd],
				createStream(stream, fd = -1) {
					stream = Object.assign(new FS.FSStream, stream);
					if (fd == -1) {
						fd = FS.nextfd()
					}
					stream.fd = fd;
					FS.streams[fd] = stream;
					return stream
				},
				closeStream(fd) {
					FS.streams[fd] = null
				},
				dupStream(origStream, fd = -1) {
					var stream = FS.createStream(origStream, fd);
					stream.stream_ops?.dup?.(stream);
					return stream
				},
				chrdev_stream_ops: {
					open(stream) {
						var device = FS.getDevice(stream.node.rdev);
						stream.stream_ops = device.stream_ops;
						stream.stream_ops.open?.(stream)
					},
					llseek() {
						throw new FS.ErrnoError(70)
					}
				},
				major: dev => dev >> 8,
				minor: dev => dev & 255,
				makedev: (ma, mi) => ma << 8 | mi,
				registerDevice(dev, ops) {
					FS.devices[dev] = {
						stream_ops: ops
					}
				},
				getDevice: dev => FS.devices[dev],
				getMounts(mount) {
					var mounts = [];
					var check = [mount];
					while (check.length) {
						var m = check.pop();
						mounts.push(m);
						check.push(...m.mounts)
					}
					return mounts
				},
				syncfs(populate, callback) {
					if (typeof populate == "function") {
						callback = populate;
						populate = false
					}
					FS.syncFSRequests++;
					if (FS.syncFSRequests > 1) {
						err(`warning: ${FS.syncFSRequests} FS.syncfs operations in flight at once, probably just doing extra work`)
					}
					var mounts = FS.getMounts(FS.root.mount);
					var completed = 0;

					function doCallback(errCode) {
						FS.syncFSRequests--;
						return callback(errCode)
					}

					function done(errCode) {
						if (errCode) {
							if (!done.errored) {
								done.errored = true;
								return doCallback(errCode)
							}
							return
						}
						if (++completed >= mounts.length) {
							doCallback(null)
						}
					}
					mounts.forEach(mount => {
						if (!mount.type.syncfs) {
							return done(null)
						}
						mount.type.syncfs(mount, populate, done)
					})
				},
				mount(type, opts, mountpoint) {
					var root = mountpoint === "/";
					var pseudo = !mountpoint;
					var node;
					if (root && FS.root) {
						throw new FS.ErrnoError(10)
					} else if (!root && !pseudo) {
						var lookup = FS.lookupPath(mountpoint, {
							follow_mount: false
						});
						mountpoint = lookup.path;
						node = lookup.node;
						if (FS.isMountpoint(node)) {
							throw new FS.ErrnoError(10)
						}
						if (!FS.isDir(node.mode)) {
							throw new FS.ErrnoError(54)
						}
					}
					var mount = {
						type: type,
						opts: opts,
						mountpoint: mountpoint,
						mounts: []
					};
					var mountRoot = type.mount(mount);
					mountRoot.mount = mount;
					mount.root = mountRoot;
					if (root) {
						FS.root = mountRoot
					} else if (node) {
						node.mounted = mount;
						if (node.mount) {
							node.mount.mounts.push(mount)
						}
					}
					return mountRoot
				},
				unmount(mountpoint) {
					var lookup = FS.lookupPath(mountpoint, {
						follow_mount: false
					});
					if (!FS.isMountpoint(lookup.node)) {
						throw new FS.ErrnoError(28)
					}
					var node = lookup.node;
					var mount = node.mounted;
					var mounts = FS.getMounts(mount);
					Object.keys(FS.nameTable).forEach(hash => {
						var current = FS.nameTable[hash];
						while (current) {
							var next = current.name_next;
							if (mounts.includes(current.mount)) {
								FS.destroyNode(current)
							}
							current = next
						}
					});
					node.mounted = null;
					var idx = node.mount.mounts.indexOf(mount);
					node.mount.mounts.splice(idx, 1)
				},
				lookup(parent, name) {
					return parent.node_ops.lookup(parent, name)
				},
				mknod(path, mode, dev) {
					var lookup = FS.lookupPath(path, {
						parent: true
					});
					var parent = lookup.node;
					var name = PATH.basename(path);
					if (!name || name === "." || name === "..") {
						throw new FS.ErrnoError(28)
					}
					var errCode = FS.mayCreate(parent, name);
					if (errCode) {
						throw new FS.ErrnoError(errCode)
					}
					if (!parent.node_ops.mknod) {
						throw new FS.ErrnoError(63)
					}
					return parent.node_ops.mknod(parent, name, mode, dev)
				},
				create(path, mode) {
					mode = mode !== undefined ? mode : 438;
					mode &= 4095;
					mode |= 32768;
					return FS.mknod(path, mode, 0)
				},
				mkdir(path, mode) {
					mode = mode !== undefined ? mode : 511;
					mode &= 511 | 512;
					mode |= 16384;
					return FS.mknod(path, mode, 0)
				},
				mkdirTree(path, mode) {
					var dirs = path.split("/");
					var d = "";
					for (var i = 0; i < dirs.length; ++i) {
						if (!dirs[i]) continue;
						d += "/" + dirs[i];
						try {
							FS.mkdir(d, mode)
						} catch (e) {
							if (e.errno != 20) throw e
						}
					}
				},
				mkdev(path, mode, dev) {
					if (typeof dev == "undefined") {
						dev = mode;
						mode = 438
					}
					mode |= 8192;
					return FS.mknod(path, mode, dev)
				},
				symlink(oldpath, newpath) {
					if (!PATH_FS.resolve(oldpath)) {
						throw new FS.ErrnoError(44)
					}
					var lookup = FS.lookupPath(newpath, {
						parent: true
					});
					var parent = lookup.node;
					if (!parent) {
						throw new FS.ErrnoError(44)
					}
					var newname = PATH.basename(newpath);
					var errCode = FS.mayCreate(parent, newname);
					if (errCode) {
						throw new FS.ErrnoError(errCode)
					}
					if (!parent.node_ops.symlink) {
						throw new FS.ErrnoError(63)
					}
					return parent.node_ops.symlink(parent, newname, oldpath)
				},
				rename(old_path, new_path) {
					var old_dirname = PATH.dirname(old_path);
					var new_dirname = PATH.dirname(new_path);
					var old_name = PATH.basename(old_path);
					var new_name = PATH.basename(new_path);
					var lookup, old_dir, new_dir;
					lookup = FS.lookupPath(old_path, {
						parent: true
					});
					old_dir = lookup.node;
					lookup = FS.lookupPath(new_path, {
						parent: true
					});
					new_dir = lookup.node;
					if (!old_dir || !new_dir) throw new FS.ErrnoError(44);
					if (old_dir.mount !== new_dir.mount) {
						throw new FS.ErrnoError(75)
					}
					var old_node = FS.lookupNode(old_dir, old_name);
					var relative = PATH_FS.relative(old_path, new_dirname);
					if (relative.charAt(0) !== ".") {
						throw new FS.ErrnoError(28)
					}
					relative = PATH_FS.relative(new_path, old_dirname);
					if (relative.charAt(0) !== ".") {
						throw new FS.ErrnoError(55)
					}
					var new_node;
					try {
						new_node = FS.lookupNode(new_dir, new_name)
					} catch (e) {}
					if (old_node === new_node) {
						return
					}
					var isdir = FS.isDir(old_node.mode);
					var errCode = FS.mayDelete(old_dir, old_name, isdir);
					if (errCode) {
						throw new FS.ErrnoError(errCode)
					}
					errCode = new_node ? FS.mayDelete(new_dir, new_name, isdir) : FS.mayCreate(new_dir, new_name);
					if (errCode) {
						throw new FS.ErrnoError(errCode)
					}
					if (!old_dir.node_ops.rename) {
						throw new FS.ErrnoError(63)
					}
					if (FS.isMountpoint(old_node) || new_node && FS.isMountpoint(new_node)) {
						throw new FS.ErrnoError(10)
					}
					if (new_dir !== old_dir) {
						errCode = FS.nodePermissions(old_dir, "w");
						if (errCode) {
							throw new FS.ErrnoError(errCode)
						}
					}
					FS.hashRemoveNode(old_node);
					try {
						old_dir.node_ops.rename(old_node, new_dir, new_name);
						old_node.parent = new_dir
					} catch (e) {
						throw e
					} finally {
						FS.hashAddNode(old_node)
					}
				},
				rmdir(path) {
					var lookup = FS.lookupPath(path, {
						parent: true
					});
					var parent = lookup.node;
					var name = PATH.basename(path);
					var node = FS.lookupNode(parent, name);
					var errCode = FS.mayDelete(parent, name, true);
					if (errCode) {
						throw new FS.ErrnoError(errCode)
					}
					if (!parent.node_ops.rmdir) {
						throw new FS.ErrnoError(63)
					}
					if (FS.isMountpoint(node)) {
						throw new FS.ErrnoError(10)
					}
					parent.node_ops.rmdir(parent, name);
					FS.destroyNode(node)
				},
				readdir(path) {
					var lookup = FS.lookupPath(path, {
						follow: true
					});
					var node = lookup.node;
					if (!node.node_ops.readdir) {
						throw new FS.ErrnoError(54)
					}
					return node.node_ops.readdir(node)
				},
				unlink(path) {
					var lookup = FS.lookupPath(path, {
						parent: true
					});
					var parent = lookup.node;
					if (!parent) {
						throw new FS.ErrnoError(44)
					}
					var name = PATH.basename(path);
					var node = FS.lookupNode(parent, name);
					var errCode = FS.mayDelete(parent, name, false);
					if (errCode) {
						throw new FS.ErrnoError(errCode)
					}
					if (!parent.node_ops.unlink) {
						throw new FS.ErrnoError(63)
					}
					if (FS.isMountpoint(node)) {
						throw new FS.ErrnoError(10)
					}
					parent.node_ops.unlink(parent, name);
					FS.destroyNode(node)
				},
				readlink(path) {
					var lookup = FS.lookupPath(path);
					var link = lookup.node;
					if (!link) {
						throw new FS.ErrnoError(44)
					}
					if (!link.node_ops.readlink) {
						throw new FS.ErrnoError(28)
					}
					return PATH_FS.resolve(FS.getPath(link.parent), link.node_ops.readlink(link))
				},
				stat(path, dontFollow) {
					var lookup = FS.lookupPath(path, {
						follow: !dontFollow
					});
					var node = lookup.node;
					if (!node) {
						throw new FS.ErrnoError(44)
					}
					if (!node.node_ops.getattr) {
						throw new FS.ErrnoError(63)
					}
					return node.node_ops.getattr(node)
				},
				lstat(path) {
					return FS.stat(path, true)
				},
				chmod(path, mode, dontFollow) {
					var node;
					if (typeof path == "string") {
						var lookup = FS.lookupPath(path, {
							follow: !dontFollow
						});
						node = lookup.node
					} else {
						node = path
					}
					if (!node.node_ops.setattr) {
						throw new FS.ErrnoError(63)
					}
					node.node_ops.setattr(node, {
						mode: mode & 4095 | node.mode & ~4095,
						timestamp: Date.now()
					})
				},
				lchmod(path, mode) {
					FS.chmod(path, mode, true)
				},
				fchmod(fd, mode) {
					var stream = FS.getStreamChecked(fd);
					FS.chmod(stream.node, mode)
				},
				chown(path, uid, gid, dontFollow) {
					var node;
					if (typeof path == "string") {
						var lookup = FS.lookupPath(path, {
							follow: !dontFollow
						});
						node = lookup.node
					} else {
						node = path
					}
					if (!node.node_ops.setattr) {
						throw new FS.ErrnoError(63)
					}
					node.node_ops.setattr(node, {
						timestamp: Date.now()
					})
				},
				lchown(path, uid, gid) {
					FS.chown(path, uid, gid, true)
				},
				fchown(fd, uid, gid) {
					var stream = FS.getStreamChecked(fd);
					FS.chown(stream.node, uid, gid)
				},
				truncate(path, len) {
					if (len < 0) {
						throw new FS.ErrnoError(28)
					}
					var node;
					if (typeof path == "string") {
						var lookup = FS.lookupPath(path, {
							follow: true
						});
						node = lookup.node
					} else {
						node = path
					}
					if (!node.node_ops.setattr) {
						throw new FS.ErrnoError(63)
					}
					if (FS.isDir(node.mode)) {
						throw new FS.ErrnoError(31)
					}
					if (!FS.isFile(node.mode)) {
						throw new FS.ErrnoError(28)
					}
					var errCode = FS.nodePermissions(node, "w");
					if (errCode) {
						throw new FS.ErrnoError(errCode)
					}
					node.node_ops.setattr(node, {
						size: len,
						timestamp: Date.now()
					})
				},
				ftruncate(fd, len) {
					var stream = FS.getStreamChecked(fd);
					if ((stream.flags & 2097155) === 0) {
						throw new FS.ErrnoError(28)
					}
					FS.truncate(stream.node, len)
				},
				utime(path, atime, mtime) {
					var lookup = FS.lookupPath(path, {
						follow: true
					});
					var node = lookup.node;
					node.node_ops.setattr(node, {
						timestamp: Math.max(atime, mtime)
					})
				},
				open(path, flags, mode) {
					if (path === "") {
						throw new FS.ErrnoError(44)
					}
					flags = typeof flags == "string" ? FS_modeStringToFlags(flags) : flags;
					if (flags & 64) {
						mode = typeof mode == "undefined" ? 438 : mode;
						mode = mode & 4095 | 32768
					} else {
						mode = 0
					}
					var node;
					if (typeof path == "object") {
						node = path
					} else {
						path = PATH.normalize(path);
						try {
							var lookup = FS.lookupPath(path, {
								follow: !(flags & 131072)
							});
							node = lookup.node
						} catch (e) {}
					}
					var created = false;
					if (flags & 64) {
						if (node) {
							if (flags & 128) {
								throw new FS.ErrnoError(20)
							}
						} else {
							node = FS.mknod(path, mode, 0);
							created = true
						}
					}
					if (!node) {
						throw new FS.ErrnoError(44)
					}
					if (FS.isChrdev(node.mode)) {
						flags &= ~512
					}
					if (flags & 65536 && !FS.isDir(node.mode)) {
						throw new FS.ErrnoError(54)
					}
					if (!created) {
						var errCode = FS.mayOpen(node, flags);
						if (errCode) {
							throw new FS.ErrnoError(errCode)
						}
					}
					if (flags & 512 && !created) {
						FS.truncate(node, 0)
					}
					flags &= ~(128 | 512 | 131072);
					var stream = FS.createStream({
						node: node,
						path: FS.getPath(node),
						flags: flags,
						seekable: true,
						position: 0,
						stream_ops: node.stream_ops,
						ungotten: [],
						error: false
					});
					if (stream.stream_ops.open) {
						stream.stream_ops.open(stream)
					}
					if (Module["logReadFiles"] && !(flags & 1)) {
						if (!FS.readFiles) FS.readFiles = {};
						if (!(path in FS.readFiles)) {
							FS.readFiles[path] = 1
						}
					}
					return stream
				},
				close(stream) {
					if (FS.isClosed(stream)) {
						throw new FS.ErrnoError(8)
					}
					if (stream.getdents) stream.getdents = null;
					try {
						if (stream.stream_ops.close) {
							stream.stream_ops.close(stream)
						}
					} catch (e) {
						throw e
					} finally {
						FS.closeStream(stream.fd)
					}
					stream.fd = null
				},
				isClosed(stream) {
					return stream.fd === null
				},
				llseek(stream, offset, whence) {
					if (FS.isClosed(stream)) {
						throw new FS.ErrnoError(8)
					}
					if (!stream.seekable || !stream.stream_ops.llseek) {
						throw new FS.ErrnoError(70)
					}
					if (whence != 0 && whence != 1 && whence != 2) {
						throw new FS.ErrnoError(28)
					}
					stream.position = stream.stream_ops.llseek(stream, offset, whence);
					stream.ungotten = [];
					return stream.position
				},
				read(stream, buffer, offset, length, position) {
					if (length < 0 || position < 0) {
						throw new FS.ErrnoError(28)
					}
					if (FS.isClosed(stream)) {
						throw new FS.ErrnoError(8)
					}
					if ((stream.flags & 2097155) === 1) {
						throw new FS.ErrnoError(8)
					}
					if (FS.isDir(stream.node.mode)) {
						throw new FS.ErrnoError(31)
					}
					if (!stream.stream_ops.read) {
						throw new FS.ErrnoError(28)
					}
					var seeking = typeof position != "undefined";
					if (!seeking) {
						position = stream.position
					} else if (!stream.seekable) {
						throw new FS.ErrnoError(70)
					}
					var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
					if (!seeking) stream.position += bytesRead;
					return bytesRead
				},
				write(stream, buffer, offset, length, position, canOwn) {
					if (length < 0 || position < 0) {
						throw new FS.ErrnoError(28)
					}
					if (FS.isClosed(stream)) {
						throw new FS.ErrnoError(8)
					}
					if ((stream.flags & 2097155) === 0) {
						throw new FS.ErrnoError(8)
					}
					if (FS.isDir(stream.node.mode)) {
						throw new FS.ErrnoError(31)
					}
					if (!stream.stream_ops.write) {
						throw new FS.ErrnoError(28)
					}
					if (stream.seekable && stream.flags & 1024) {
						FS.llseek(stream, 0, 2)
					}
					var seeking = typeof position != "undefined";
					if (!seeking) {
						position = stream.position
					} else if (!stream.seekable) {
						throw new FS.ErrnoError(70)
					}
					var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
					if (!seeking) stream.position += bytesWritten;
					return bytesWritten
				},
				allocate(stream, offset, length) {
					if (FS.isClosed(stream)) {
						throw new FS.ErrnoError(8)
					}
					if (offset < 0 || length <= 0) {
						throw new FS.ErrnoError(28)
					}
					if ((stream.flags & 2097155) === 0) {
						throw new FS.ErrnoError(8)
					}
					if (!FS.isFile(stream.node.mode) && !FS.isDir(stream.node.mode)) {
						throw new FS.ErrnoError(43)
					}
					if (!stream.stream_ops.allocate) {
						throw new FS.ErrnoError(138)
					}
					stream.stream_ops.allocate(stream, offset, length)
				},
				mmap(stream, length, position, prot, flags) {
					if ((prot & 2) !== 0 && (flags & 2) === 0 && (stream.flags & 2097155) !== 2) {
						throw new FS.ErrnoError(2)
					}
					if ((stream.flags & 2097155) === 1) {
						throw new FS.ErrnoError(2)
					}
					if (!stream.stream_ops.mmap) {
						throw new FS.ErrnoError(43)
					}
					if (!length) {
						throw new FS.ErrnoError(28)
					}
					return stream.stream_ops.mmap(stream, length, position, prot, flags)
				},
				msync(stream, buffer, offset, length, mmapFlags) {
					if (!stream.stream_ops.msync) {
						return 0
					}
					return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags)
				},
				ioctl(stream, cmd, arg) {
					if (!stream.stream_ops.ioctl) {
						throw new FS.ErrnoError(59)
					}
					return stream.stream_ops.ioctl(stream, cmd, arg)
				},
				readFile(path, opts = {}) {
					opts.flags = opts.flags || 0;
					opts.encoding = opts.encoding || "binary";
					if (opts.encoding !== "utf8" && opts.encoding !== "binary") {
						throw new Error(`Invalid encoding type "${opts.encoding}"`)
					}
					var ret;
					var stream = FS.open(path, opts.flags);
					var stat = FS.stat(path);
					var length = stat.size;
					var buf = new Uint8Array(length);
					FS.read(stream, buf, 0, length, 0);
					if (opts.encoding === "utf8") {
						ret = UTF8ArrayToString(buf, 0)
					} else if (opts.encoding === "binary") {
						ret = buf
					}
					FS.close(stream);
					return ret
				},
				writeFile(path, data, opts = {}) {
					opts.flags = opts.flags || 577;
					var stream = FS.open(path, opts.flags, opts.mode);
					if (typeof data == "string") {
						var buf = new Uint8Array(lengthBytesUTF8(data) + 1);
						var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
						FS.write(stream, buf, 0, actualNumBytes, undefined, opts.canOwn)
					} else if (ArrayBuffer.isView(data)) {
						FS.write(stream, data, 0, data.byteLength, undefined, opts.canOwn)
					} else {
						throw new Error("Unsupported data type")
					}
					FS.close(stream)
				},
				cwd: () => FS.currentPath,
				chdir(path) {
					var lookup = FS.lookupPath(path, {
						follow: true
					});
					if (lookup.node === null) {
						throw new FS.ErrnoError(44)
					}
					if (!FS.isDir(lookup.node.mode)) {
						throw new FS.ErrnoError(54)
					}
					var errCode = FS.nodePermissions(lookup.node, "x");
					if (errCode) {
						throw new FS.ErrnoError(errCode)
					}
					FS.currentPath = lookup.path
				},
				createDefaultDirectories() {
					FS.mkdir("/tmp");
					FS.mkdir("/home");
					FS.mkdir("/home/web_user")
				},
				createDefaultDevices() {
					FS.mkdir("/dev");
					FS.registerDevice(FS.makedev(1, 3), {
						read: () => 0,
						write: (stream, buffer, offset, length, pos) => length
					});
					FS.mkdev("/dev/null", FS.makedev(1, 3));
					TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
					TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
					FS.mkdev("/dev/tty", FS.makedev(5, 0));
					FS.mkdev("/dev/tty1", FS.makedev(6, 0));
					var randomBuffer = new Uint8Array(1024),
						randomLeft = 0;
					var randomByte = () => {
						if (randomLeft === 0) {
							randomLeft = randomFill(randomBuffer).byteLength
						}
						return randomBuffer[--randomLeft]
					};
					FS.createDevice("/dev", "random", randomByte);
					FS.createDevice("/dev", "urandom", randomByte);
					FS.mkdir("/dev/shm");
					FS.mkdir("/dev/shm/tmp")
				},
				createSpecialDirectories() {
					FS.mkdir("/proc");
					var proc_self = FS.mkdir("/proc/self");
					FS.mkdir("/proc/self/fd");
					FS.mount({
						mount() {
							var node = FS.createNode(proc_self, "fd", 16384 | 511, 73);
							node.node_ops = {
								lookup(parent, name) {
									var fd = +name;
									var stream = FS.getStreamChecked(fd);
									var ret = {
										parent: null,
										mount: {
											mountpoint: "fake"
										},
										node_ops: {
											readlink: () => stream.path
										}
									};
									ret.parent = ret;
									return ret
								}
							};
							return node
						}
					}, {}, "/proc/self/fd")
				},
				createStandardStreams(input, output, error) {
					if (input) {
						FS.createDevice("/dev", "stdin", input)
					} else {
						FS.symlink("/dev/tty", "/dev/stdin")
					}
					if (output) {
						FS.createDevice("/dev", "stdout", null, output)
					} else {
						FS.symlink("/dev/tty", "/dev/stdout")
					}
					if (error) {
						FS.createDevice("/dev", "stderr", null, error)
					} else {
						FS.symlink("/dev/tty1", "/dev/stderr")
					}
					var stdin = FS.open("/dev/stdin", 0);
					var stdout = FS.open("/dev/stdout", 1);
					var stderr = FS.open("/dev/stderr", 1)
				},
				staticInit() {
					[44].forEach(code => {
						FS.genericErrors[code] = new FS.ErrnoError(code);
						FS.genericErrors[code].stack = "<generic error, no stack>"
					});
					FS.nameTable = new Array(4096);
					FS.mount(MEMFS, {}, "/");
					FS.createDefaultDirectories();
					FS.createDefaultDevices();
					FS.createSpecialDirectories();
					FS.filesystems = {
						MEMFS: MEMFS
					}
				},
				init(input, output, error) {
					FS.initialized = true;
					input ??= Module["stdin"];
					output ??= Module["stdout"];
					error ??= Module["stderr"];
					FS.createStandardStreams(input, output, error)
				},
				quit() {
					FS.initialized = false;
					for (var i = 0; i < FS.streams.length; i++) {
						var stream = FS.streams[i];
						if (!stream) {
							continue
						}
						FS.close(stream)
					}
				},
				findObject(path, dontResolveLastLink) {
					var ret = FS.analyzePath(path, dontResolveLastLink);
					if (!ret.exists) {
						return null
					}
					return ret.object
				},
				analyzePath(path, dontResolveLastLink) {
					try {
						var lookup = FS.lookupPath(path, {
							follow: !dontResolveLastLink
						});
						path = lookup.path
					} catch (e) {}
					var ret = {
						isRoot: false,
						exists: false,
						error: 0,
						name: null,
						path: null,
						object: null,
						parentExists: false,
						parentPath: null,
						parentObject: null
					};
					try {
						var lookup = FS.lookupPath(path, {
							parent: true
						});
						ret.parentExists = true;
						ret.parentPath = lookup.path;
						ret.parentObject = lookup.node;
						ret.name = PATH.basename(path);
						lookup = FS.lookupPath(path, {
							follow: !dontResolveLastLink
						});
						ret.exists = true;
						ret.path = lookup.path;
						ret.object = lookup.node;
						ret.name = lookup.node.name;
						ret.isRoot = lookup.path === "/"
					} catch (e) {
						ret.error = e.errno
					}
					return ret
				},
				createPath(parent, path, canRead, canWrite) {
					parent = typeof parent == "string" ? parent : FS.getPath(parent);
					var parts = path.split("/").reverse();
					while (parts.length) {
						var part = parts.pop();
						if (!part) continue;
						var current = PATH.join2(parent, part);
						try {
							FS.mkdir(current)
						} catch (e) {}
						parent = current
					}
					return current
				},
				createFile(parent, name, properties, canRead, canWrite) {
					var path = PATH.join2(typeof parent == "string" ? parent : FS.getPath(parent), name);
					var mode = FS_getMode(canRead, canWrite);
					return FS.create(path, mode)
				},
				createDataFile(parent, name, data, canRead, canWrite, canOwn) {
					var path = name;
					if (parent) {
						parent = typeof parent == "string" ? parent : FS.getPath(parent);
						path = name ? PATH.join2(parent, name) : parent
					}
					var mode = FS_getMode(canRead, canWrite);
					var node = FS.create(path, mode);
					if (data) {
						if (typeof data == "string") {
							var arr = new Array(data.length);
							for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
							data = arr
						}
						FS.chmod(node, mode | 146);
						var stream = FS.open(node, 577);
						FS.write(stream, data, 0, data.length, 0, canOwn);
						FS.close(stream);
						FS.chmod(node, mode)
					}
				},
				createDevice(parent, name, input, output) {
					var path = PATH.join2(typeof parent == "string" ? parent : FS.getPath(parent), name);
					var mode = FS_getMode(!!input, !!output);
					if (!FS.createDevice.major) FS.createDevice.major = 64;
					var dev = FS.makedev(FS.createDevice.major++, 0);
					FS.registerDevice(dev, {
						open(stream) {
							stream.seekable = false
						},
						close(stream) {
							if (output?.buffer?.length) {
								output(10)
							}
						},
						read(stream, buffer, offset, length, pos) {
							var bytesRead = 0;
							for (var i = 0; i < length; i++) {
								var result;
								try {
									result = input()
								} catch (e) {
									throw new FS.ErrnoError(29)
								}
								if (result === undefined && bytesRead === 0) {
									throw new FS.ErrnoError(6)
								}
								if (result === null || result === undefined) break;
								bytesRead++;
								buffer[offset + i] = result
							}
							if (bytesRead) {
								stream.node.timestamp = Date.now()
							}
							return bytesRead
						},
						write(stream, buffer, offset, length, pos) {
							for (var i = 0; i < length; i++) {
								try {
									output(buffer[offset + i])
								} catch (e) {
									throw new FS.ErrnoError(29)
								}
							}
							if (length) {
								stream.node.timestamp = Date.now()
							}
							return i
						}
					});
					return FS.mkdev(path, mode, dev)
				},
				forceLoadFile(obj) {
					if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
					if (typeof XMLHttpRequest != "undefined") {
						throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.")
					} else {
						try {
							obj.contents = readBinary(obj.url);
							obj.usedBytes = obj.contents.length
						} catch (e) {
							throw new FS.ErrnoError(29)
						}
					}
				},
				createLazyFile(parent, name, url, canRead, canWrite) {
					class LazyUint8Array {
						constructor() {
							this.lengthKnown = false;
							this.chunks = []
						}
						get(idx) {
							if (idx > this.length - 1 || idx < 0) {
								return undefined
							}
							var chunkOffset = idx % this.chunkSize;
							var chunkNum = idx / this.chunkSize | 0;
							return this.getter(chunkNum)[chunkOffset]
						}
						setDataGetter(getter) {
							this.getter = getter
						}
						cacheLength() {
							var xhr = new XMLHttpRequest;
							xhr.open("HEAD", url, false);
							xhr.send(null);
							if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
							var datalength = Number(xhr.getResponseHeader("Content-length"));
							var header;
							var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
							var usesGzip = (header = xhr.getResponseHeader("Content-Encoding")) && header === "gzip";
							var chunkSize = 1024 * 1024;
							if (!hasByteServing) chunkSize = datalength;
							var doXHR = (from, to) => {
								if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
								if (to > datalength - 1) throw new Error("only " + datalength + " bytes available! programmer error!");
								var xhr = new XMLHttpRequest;
								xhr.open("GET", url, false);
								if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
								xhr.responseType = "arraybuffer";
								if (xhr.overrideMimeType) {
									xhr.overrideMimeType("text/plain; charset=x-user-defined")
								}
								xhr.send(null);
								if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
								if (xhr.response !== undefined) {
									return new Uint8Array(xhr.response || [])
								}
								return intArrayFromString(xhr.responseText || "", true)
							};
							var lazyArray = this;
							lazyArray.setDataGetter(chunkNum => {
								var start = chunkNum * chunkSize;
								var end = (chunkNum + 1) * chunkSize - 1;
								end = Math.min(end, datalength - 1);
								if (typeof lazyArray.chunks[chunkNum] == "undefined") {
									lazyArray.chunks[chunkNum] = doXHR(start, end)
								}
								if (typeof lazyArray.chunks[chunkNum] == "undefined") throw new Error("doXHR failed!");
								return lazyArray.chunks[chunkNum]
							});
							if (usesGzip || !datalength) {
								chunkSize = datalength = 1;
								datalength = this.getter(0).length;
								chunkSize = datalength;
								out("LazyFiles on gzip forces download of the whole file when length is accessed")
							}
							this._length = datalength;
							this._chunkSize = chunkSize;
							this.lengthKnown = true
						}
						get length() {
							if (!this.lengthKnown) {
								this.cacheLength()
							}
							return this._length
						}
						get chunkSize() {
							if (!this.lengthKnown) {
								this.cacheLength()
							}
							return this._chunkSize
						}
					}
					if (typeof XMLHttpRequest != "undefined") {
						if (!ENVIRONMENT_IS_WORKER) throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";
						var lazyArray = new LazyUint8Array;
						var properties = {
							isDevice: false,
							contents: lazyArray
						}
					} else {
						var properties = {
							isDevice: false,
							url: url
						}
					}
					var node = FS.createFile(parent, name, properties, canRead, canWrite);
					if (properties.contents) {
						node.contents = properties.contents
					} else if (properties.url) {
						node.contents = null;
						node.url = properties.url
					}
					Object.defineProperties(node, {
						usedBytes: {
							get: function() {
								return this.contents.length
							}
						}
					});
					var stream_ops = {};
					var keys = Object.keys(node.stream_ops);
					keys.forEach(key => {
						var fn = node.stream_ops[key];
						stream_ops[key] = (...args) => {
							FS.forceLoadFile(node);
							return fn(...args)
						}
					});

					function writeChunks(stream, buffer, offset, length, position) {
						var contents = stream.node.contents;
						if (position >= contents.length) return 0;
						var size = Math.min(contents.length - position, length);
						if (contents.slice) {
							for (var i = 0; i < size; i++) {
								buffer[offset + i] = contents[position + i]
							}
						} else {
							for (var i = 0; i < size; i++) {
								buffer[offset + i] = contents.get(position + i)
							}
						}
						return size
					}
					stream_ops.read = (stream, buffer, offset, length, position) => {
						FS.forceLoadFile(node);
						return writeChunks(stream, buffer, offset, length, position)
					};
					stream_ops.mmap = (stream, length, position, prot, flags) => {
						FS.forceLoadFile(node);
						var ptr = mmapAlloc(length);
						if (!ptr) {
							throw new FS.ErrnoError(48)
						}
						writeChunks(stream, GROWABLE_HEAP_I8(), ptr, length, position);
						return {
							ptr: ptr,
							allocated: true
						}
					};
					node.stream_ops = stream_ops;
					return node
				}
			};
			Module["FS"] = FS;
			var UTF8ToString = (ptr, maxBytesToRead) => {
				ptr >>>= 0;
				return ptr ? UTF8ArrayToString(GROWABLE_HEAP_U8(), ptr, maxBytesToRead) : ""
			};
			Module["UTF8ToString"] = UTF8ToString;
			var SYSCALLS = {
				DEFAULT_POLLMASK: 5,
				calculateAt(dirfd, path, allowEmpty) {
					if (PATH.isAbs(path)) {
						return path
					}
					var dir;
					if (dirfd === -100) {
						dir = FS.cwd()
					} else {
						var dirstream = SYSCALLS.getStreamFromFD(dirfd);
						dir = dirstream.path
					}
					if (path.length == 0) {
						if (!allowEmpty) {
							throw new FS.ErrnoError(44)
						}
						return dir
					}
					return PATH.join2(dir, path)
				},
				doStat(func, path, buf) {
					var stat = func(path);
					GROWABLE_HEAP_I32()[buf >>> 2 >>> 0] = stat.dev;
					GROWABLE_HEAP_I32()[buf + 4 >>> 2 >>> 0] = stat.mode;
					GROWABLE_HEAP_U32()[buf + 8 >>> 2 >>> 0] = stat.nlink;
					GROWABLE_HEAP_I32()[buf + 12 >>> 2 >>> 0] = stat.uid;
					GROWABLE_HEAP_I32()[buf + 16 >>> 2 >>> 0] = stat.gid;
					GROWABLE_HEAP_I32()[buf + 20 >>> 2 >>> 0] = stat.rdev;
					tempI64 = [stat.size >>> 0, (tempDouble = stat.size, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], GROWABLE_HEAP_I32()[buf + 24 >>> 2 >>> 0] = tempI64[0], GROWABLE_HEAP_I32()[buf + 28 >>> 2 >>> 0] = tempI64[1];
					GROWABLE_HEAP_I32()[buf + 32 >>> 2 >>> 0] = 4096;
					GROWABLE_HEAP_I32()[buf + 36 >>> 2 >>> 0] = stat.blocks;
					var atime = stat.atime.getTime();
					var mtime = stat.mtime.getTime();
					var ctime = stat.ctime.getTime();
					tempI64 = [Math.floor(atime / 1e3) >>> 0, (tempDouble = Math.floor(atime / 1e3), +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], GROWABLE_HEAP_I32()[buf + 40 >>> 2 >>> 0] = tempI64[0], GROWABLE_HEAP_I32()[buf + 44 >>> 2 >>> 0] = tempI64[1];
					GROWABLE_HEAP_U32()[buf + 48 >>> 2 >>> 0] = atime % 1e3 * 1e3;
					tempI64 = [Math.floor(mtime / 1e3) >>> 0, (tempDouble = Math.floor(mtime / 1e3), +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], GROWABLE_HEAP_I32()[buf + 56 >>> 2 >>> 0] = tempI64[0], GROWABLE_HEAP_I32()[buf + 60 >>> 2 >>> 0] = tempI64[1];
					GROWABLE_HEAP_U32()[buf + 64 >>> 2 >>> 0] = mtime % 1e3 * 1e3;
					tempI64 = [Math.floor(ctime / 1e3) >>> 0, (tempDouble = Math.floor(ctime / 1e3), +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], GROWABLE_HEAP_I32()[buf + 72 >>> 2 >>> 0] = tempI64[0], GROWABLE_HEAP_I32()[buf + 76 >>> 2 >>> 0] = tempI64[1];
					GROWABLE_HEAP_U32()[buf + 80 >>> 2 >>> 0] = ctime % 1e3 * 1e3;
					tempI64 = [stat.ino >>> 0, (tempDouble = stat.ino, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], GROWABLE_HEAP_I32()[buf + 88 >>> 2 >>> 0] = tempI64[0], GROWABLE_HEAP_I32()[buf + 92 >>> 2 >>> 0] = tempI64[1];
					return 0
				},
				doMsync(addr, stream, len, flags, offset) {
					if (!FS.isFile(stream.node.mode)) {
						throw new FS.ErrnoError(43)
					}
					if (flags & 2) {
						return 0
					}
					var buffer = GROWABLE_HEAP_U8().slice(addr, addr + len);
					FS.msync(stream, buffer, offset, len, flags)
				},
				getStreamFromFD(fd) {
					var stream = FS.getStreamChecked(fd);
					return stream
				},
				varargs: undefined,
				getStr(ptr) {
					var ret = UTF8ToString(ptr);
					return ret
				}
			};
			Module["SYSCALLS"] = SYSCALLS;

			function ___syscall_fcntl64(fd, cmd, varargs) {
				if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(3, 0, 1, fd, cmd, varargs);
				varargs >>>= 0;
				SYSCALLS.varargs = varargs;
				try {
					var stream = SYSCALLS.getStreamFromFD(fd);
					switch (cmd) {
						case 0: {
							var arg = syscallGetVarargI();
							if (arg < 0) {
								return -28
							}
							while (FS.streams[arg]) {
								arg++
							}
							var newStream;
							newStream = FS.dupStream(stream, arg);
							return newStream.fd
						}
						case 1:
						case 2:
							return 0;
						case 3:
							return stream.flags;
						case 4: {
							var arg = syscallGetVarargI();
							stream.flags |= arg;
							return 0
						}
						case 12: {
							var arg = syscallGetVarargP();
							var offset = 0;
							GROWABLE_HEAP_I16()[arg + offset >>> 1 >>> 0] = 2;
							return 0
						}
						case 13:
						case 14:
							return 0
					}
					return -28
				} catch (e) {
					if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
					return -e.errno
				}
			}
			Module["___syscall_fcntl64"] = ___syscall_fcntl64;

			function ___syscall_fstat64(fd, buf) {
				if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(4, 0, 1, fd, buf);
				buf >>>= 0;
				try {
					var stream = SYSCALLS.getStreamFromFD(fd);
					return SYSCALLS.doStat(FS.stat, stream.path, buf)
				} catch (e) {
					if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
					return -e.errno
				}
			}
			Module["___syscall_fstat64"] = ___syscall_fstat64;

			function ___syscall_ioctl(fd, op, varargs) {
				if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(5, 0, 1, fd, op, varargs);
				varargs >>>= 0;
				SYSCALLS.varargs = varargs;
				try {
					var stream = SYSCALLS.getStreamFromFD(fd);
					switch (op) {
						case 21509: {
							if (!stream.tty) return -59;
							return 0
						}
						case 21505: {
							if (!stream.tty) return -59;
							if (stream.tty.ops.ioctl_tcgets) {
								var termios = stream.tty.ops.ioctl_tcgets(stream);
								var argp = syscallGetVarargP();
								GROWABLE_HEAP_I32()[argp >>> 2 >>> 0] = termios.c_iflag || 0;
								GROWABLE_HEAP_I32()[argp + 4 >>> 2 >>> 0] = termios.c_oflag || 0;
								GROWABLE_HEAP_I32()[argp + 8 >>> 2 >>> 0] = termios.c_cflag || 0;
								GROWABLE_HEAP_I32()[argp + 12 >>> 2 >>> 0] = termios.c_lflag || 0;
								for (var i = 0; i < 32; i++) {
									GROWABLE_HEAP_I8()[argp + i + 17 >>> 0] = termios.c_cc[i] || 0
								}
								return 0
							}
							return 0
						}
						case 21510:
						case 21511:
						case 21512: {
							if (!stream.tty) return -59;
							return 0
						}
						case 21506:
						case 21507:
						case 21508: {
							if (!stream.tty) return -59;
							if (stream.tty.ops.ioctl_tcsets) {
								var argp = syscallGetVarargP();
								var c_iflag = GROWABLE_HEAP_I32()[argp >>> 2 >>> 0];
								var c_oflag = GROWABLE_HEAP_I32()[argp + 4 >>> 2 >>> 0];
								var c_cflag = GROWABLE_HEAP_I32()[argp + 8 >>> 2 >>> 0];
								var c_lflag = GROWABLE_HEAP_I32()[argp + 12 >>> 2 >>> 0];
								var c_cc = [];
								for (var i = 0; i < 32; i++) {
									c_cc.push(GROWABLE_HEAP_I8()[argp + i + 17 >>> 0])
								}
								return stream.tty.ops.ioctl_tcsets(stream.tty, op, {
									c_iflag: c_iflag,
									c_oflag: c_oflag,
									c_cflag: c_cflag,
									c_lflag: c_lflag,
									c_cc: c_cc
								})
							}
							return 0
						}
						case 21519: {
							if (!stream.tty) return -59;
							var argp = syscallGetVarargP();
							GROWABLE_HEAP_I32()[argp >>> 2 >>> 0] = 0;
							return 0
						}
						case 21520: {
							if (!stream.tty) return -59;
							return -28
						}
						case 21531: {
							var argp = syscallGetVarargP();
							return FS.ioctl(stream, op, argp)
						}
						case 21523: {
							if (!stream.tty) return -59;
							if (stream.tty.ops.ioctl_tiocgwinsz) {
								var winsize = stream.tty.ops.ioctl_tiocgwinsz(stream.tty);
								var argp = syscallGetVarargP();
								GROWABLE_HEAP_I16()[argp >>> 1 >>> 0] = winsize[0];
								GROWABLE_HEAP_I16()[argp + 2 >>> 1 >>> 0] = winsize[1]
							}
							return 0
						}
						case 21524: {
							if (!stream.tty) return -59;
							return 0
						}
						case 21515: {
							if (!stream.tty) return -59;
							return 0
						}
						default:
							return -28
					}
				} catch (e) {
					if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
					return -e.errno
				}
			}
			Module["___syscall_ioctl"] = ___syscall_ioctl;

			function ___syscall_lstat64(path, buf) {
				if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(6, 0, 1, path, buf);
				path >>>= 0;
				buf >>>= 0;
				try {
					path = SYSCALLS.getStr(path);
					return SYSCALLS.doStat(FS.lstat, path, buf)
				} catch (e) {
					if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
					return -e.errno
				}
			}
			Module["___syscall_lstat64"] = ___syscall_lstat64;

			function ___syscall_mkdirat(dirfd, path, mode) {
				if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(7, 0, 1, dirfd, path, mode);
				path >>>= 0;
				try {
					path = SYSCALLS.getStr(path);
					path = SYSCALLS.calculateAt(dirfd, path);
					path = PATH.normalize(path);
					if (path[path.length - 1] === "/") path = path.substr(0, path.length - 1);
					FS.mkdir(path, mode, 0);
					return 0
				} catch (e) {
					if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
					return -e.errno
				}
			}
			Module["___syscall_mkdirat"] = ___syscall_mkdirat;

			function ___syscall_newfstatat(dirfd, path, buf, flags) {
				if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(8, 0, 1, dirfd, path, buf, flags);
				path >>>= 0;
				buf >>>= 0;
				try {
					path = SYSCALLS.getStr(path);
					var nofollow = flags & 256;
					var allowEmpty = flags & 4096;
					flags = flags & ~6400;
					path = SYSCALLS.calculateAt(dirfd, path, allowEmpty);
					return SYSCALLS.doStat(nofollow ? FS.lstat : FS.stat, path, buf)
				} catch (e) {
					if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
					return -e.errno
				}
			}
			Module["___syscall_newfstatat"] = ___syscall_newfstatat;

			function ___syscall_openat(dirfd, path, flags, varargs) {
				if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(9, 0, 1, dirfd, path, flags, varargs);
				path >>>= 0;
				varargs >>>= 0;
				SYSCALLS.varargs = varargs;
				try {
					path = SYSCALLS.getStr(path);
					path = SYSCALLS.calculateAt(dirfd, path);
					var mode = varargs ? syscallGetVarargI() : 0;
					return FS.open(path, flags, mode).fd
				} catch (e) {
					if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
					return -e.errno
				}
			}
			Module["___syscall_openat"] = ___syscall_openat;

			function ___syscall_stat64(path, buf) {
				if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(10, 0, 1, path, buf);
				path >>>= 0;
				buf >>>= 0;
				try {
					path = SYSCALLS.getStr(path);
					return SYSCALLS.doStat(FS.stat, path, buf)
				} catch (e) {
					if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
					return -e.errno
				}
			}
			Module["___syscall_stat64"] = ___syscall_stat64;
			var __abort_js = () => {
				abort("")
			};
			Module["__abort_js"] = __abort_js;
			var nowIsMonotonic = 1;
			Module["nowIsMonotonic"] = nowIsMonotonic;
			var __emscripten_get_now_is_monotonic = () => nowIsMonotonic;
			Module["__emscripten_get_now_is_monotonic"] = __emscripten_get_now_is_monotonic;

			function __emscripten_init_main_thread_js(tb) {
				tb >>>= 0;
				__emscripten_thread_init(tb, !ENVIRONMENT_IS_WORKER, 1, !ENVIRONMENT_IS_WEB, 65536, false);
				PThread.threadInitTLS()
			}
			Module["__emscripten_init_main_thread_js"] = __emscripten_init_main_thread_js;
			var maybeExit = () => {
				if (!keepRuntimeAlive()) {
					try {
						if (ENVIRONMENT_IS_PTHREAD) __emscripten_thread_exit(EXITSTATUS);
						else _exit(EXITSTATUS)
					} catch (e) {
						handleException(e)
					}
				}
			};
			Module["maybeExit"] = maybeExit;
			var callUserCallback = func => {
				if (ABORT) {
					return
				}
				try {
					func();
					maybeExit()
				} catch (e) {
					handleException(e)
				}
			};
			Module["callUserCallback"] = callUserCallback;

			function __emscripten_thread_mailbox_await(pthread_ptr) {
				pthread_ptr >>>= 0;
				if (typeof Atomics.waitAsync === "function") {
					var wait = Atomics.waitAsync(GROWABLE_HEAP_I32(), pthread_ptr >>> 2, pthread_ptr);
					wait.value.then(checkMailbox);
					var waitingAsync = pthread_ptr + 128;
					Atomics.store(GROWABLE_HEAP_I32(), waitingAsync >>> 2, 1)
				}
			}
			Module["__emscripten_thread_mailbox_await"] = __emscripten_thread_mailbox_await;
			var checkMailbox = () => {
				var pthread_ptr = _pthread_self();
				if (pthread_ptr) {
					__emscripten_thread_mailbox_await(pthread_ptr);
					callUserCallback(__emscripten_check_mailbox)
				}
			};
			Module["checkMailbox"] = checkMailbox;

			function __emscripten_notify_mailbox_postmessage(targetThreadId, currThreadId, mainThreadId) {
				targetThreadId >>>= 0;
				currThreadId >>>= 0;
				mainThreadId >>>= 0;
				if (targetThreadId == currThreadId) {
					setTimeout(checkMailbox)
				} else if (ENVIRONMENT_IS_PTHREAD) {
					postMessage({
						targetThread: targetThreadId,
						cmd: "checkMailbox"
					})
				} else {
					var worker = PThread.pthreads[targetThreadId];
					if (!worker) {
						return
					}
					worker.postMessage({
						cmd: "checkMailbox"
					})
				}
			}
			Module["__emscripten_notify_mailbox_postmessage"] = __emscripten_notify_mailbox_postmessage;
			var proxiedJSCallArgs = [];
			Module["proxiedJSCallArgs"] = proxiedJSCallArgs;

			function __emscripten_receive_on_main_thread_js(funcIndex, emAsmAddr, callingThread, numCallArgs, args) {
				emAsmAddr >>>= 0;
				callingThread >>>= 0;
				args >>>= 0;
				proxiedJSCallArgs.length = numCallArgs;
				var b = args >>> 3;
				for (var i = 0; i < numCallArgs; i++) {
					proxiedJSCallArgs[i] = GROWABLE_HEAP_F64()[b + i >>> 0]
				}
				var func = proxiedFunctionTable[funcIndex];
				PThread.currentProxiedOperationCallerThread = callingThread;
				var rtn = func(...proxiedJSCallArgs);
				PThread.currentProxiedOperationCallerThread = 0;
				return rtn
			}
			Module["__emscripten_receive_on_main_thread_js"] = __emscripten_receive_on_main_thread_js;

			function __emscripten_runtime_keepalive_clear() {
				if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(11, 0, 1);
				noExitRuntime = false;
				runtimeKeepaliveCounter = 0
			}
			Module["__emscripten_runtime_keepalive_clear"] = __emscripten_runtime_keepalive_clear;

			function __emscripten_thread_cleanup(thread) {
				thread >>>= 0;
				if (!ENVIRONMENT_IS_PTHREAD) cleanupThread(thread);
				else postMessage({
					cmd: "cleanupThread",
					thread: thread
				})
			}
			Module["__emscripten_thread_cleanup"] = __emscripten_thread_cleanup;

			function __emscripten_thread_set_strongref(thread) {
				thread >>>= 0;
				if (ENVIRONMENT_IS_NODE) {
					PThread.pthreads[thread].ref()
				}
			}
			Module["__emscripten_thread_set_strongref"] = __emscripten_thread_set_strongref;
			var isLeapYear = year => year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
			Module["isLeapYear"] = isLeapYear;
			var MONTH_DAYS_LEAP_CUMULATIVE = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];
			Module["MONTH_DAYS_LEAP_CUMULATIVE"] = MONTH_DAYS_LEAP_CUMULATIVE;
			var MONTH_DAYS_REGULAR_CUMULATIVE = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
			Module["MONTH_DAYS_REGULAR_CUMULATIVE"] = MONTH_DAYS_REGULAR_CUMULATIVE;
			var ydayFromDate = date => {
				var leap = isLeapYear(date.getFullYear());
				var monthDaysCumulative = leap ? MONTH_DAYS_LEAP_CUMULATIVE : MONTH_DAYS_REGULAR_CUMULATIVE;
				var yday = monthDaysCumulative[date.getMonth()] + date.getDate() - 1;
				return yday
			};
			Module["ydayFromDate"] = ydayFromDate;

			function __localtime_js(time_low, time_high, tmPtr) {
				var time = convertI32PairToI53Checked(time_low, time_high);
				tmPtr >>>= 0;
				var date = new Date(time * 1e3);
				GROWABLE_HEAP_I32()[tmPtr >>> 2 >>> 0] = date.getSeconds();
				GROWABLE_HEAP_I32()[tmPtr + 4 >>> 2 >>> 0] = date.getMinutes();
				GROWABLE_HEAP_I32()[tmPtr + 8 >>> 2 >>> 0] = date.getHours();
				GROWABLE_HEAP_I32()[tmPtr + 12 >>> 2 >>> 0] = date.getDate();
				GROWABLE_HEAP_I32()[tmPtr + 16 >>> 2 >>> 0] = date.getMonth();
				GROWABLE_HEAP_I32()[tmPtr + 20 >>> 2 >>> 0] = date.getFullYear() - 1900;
				GROWABLE_HEAP_I32()[tmPtr + 24 >>> 2 >>> 0] = date.getDay();
				var yday = ydayFromDate(date) | 0;
				GROWABLE_HEAP_I32()[tmPtr + 28 >>> 2 >>> 0] = yday;
				GROWABLE_HEAP_I32()[tmPtr + 36 >>> 2 >>> 0] = -(date.getTimezoneOffset() * 60);
				var start = new Date(date.getFullYear(), 0, 1);
				var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
				var winterOffset = start.getTimezoneOffset();
				var dst = (summerOffset != winterOffset && date.getTimezoneOffset() == Math.min(winterOffset, summerOffset)) | 0;
				GROWABLE_HEAP_I32()[tmPtr + 32 >>> 2 >>> 0] = dst
			}
			Module["__localtime_js"] = __localtime_js;

			function __mmap_js(len, prot, flags, fd, offset_low, offset_high, allocated, addr) {
				if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(12, 0, 1, len, prot, flags, fd, offset_low, offset_high, allocated, addr);
				len >>>= 0;
				var offset = convertI32PairToI53Checked(offset_low, offset_high);
				allocated >>>= 0;
				addr >>>= 0;
				try {
					if (isNaN(offset)) return 61;
					var stream = SYSCALLS.getStreamFromFD(fd);
					var res = FS.mmap(stream, len, offset, prot, flags);
					var ptr = res.ptr;
					GROWABLE_HEAP_I32()[allocated >>> 2 >>> 0] = res.allocated;
					GROWABLE_HEAP_U32()[addr >>> 2 >>> 0] = ptr;
					return 0
				} catch (e) {
					if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
					return -e.errno
				}
			}
			Module["__mmap_js"] = __mmap_js;

			function __munmap_js(addr, len, prot, flags, fd, offset_low, offset_high) {
				if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(13, 0, 1, addr, len, prot, flags, fd, offset_low, offset_high);
				addr >>>= 0;
				len >>>= 0;
				var offset = convertI32PairToI53Checked(offset_low, offset_high);
				try {
					var stream = SYSCALLS.getStreamFromFD(fd);
					if (prot & 2) {
						SYSCALLS.doMsync(addr, stream, len, flags, offset)
					}
				} catch (e) {
					if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
					return -e.errno
				}
			}
			Module["__munmap_js"] = __munmap_js;
			var timers = {};
			Module["timers"] = timers;
			var _emscripten_get_now;
			_emscripten_get_now = () => performance.timeOrigin + performance.now();
			Module["_emscripten_get_now"] = _emscripten_get_now;

			function __setitimer_js(which, timeout_ms) {
				if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(14, 0, 1, which, timeout_ms);
				if (timers[which]) {
					clearTimeout(timers[which].id);
					delete timers[which]
				}
				if (!timeout_ms) return 0;
				var id = setTimeout(() => {
					delete timers[which];
					callUserCallback(() => __emscripten_timeout(which, _emscripten_get_now()))
				}, timeout_ms);
				timers[which] = {
					id: id,
					timeout_ms: timeout_ms
				};
				return 0
			}
			Module["__setitimer_js"] = __setitimer_js;
			var stringToUTF8 = (str, outPtr, maxBytesToWrite) => stringToUTF8Array(str, GROWABLE_HEAP_U8(), outPtr, maxBytesToWrite);
			Module["stringToUTF8"] = stringToUTF8;
			var __tzset_js = function(timezone, daylight, std_name, dst_name) {
				timezone >>>= 0;
				daylight >>>= 0;
				std_name >>>= 0;
				dst_name >>>= 0;
				var currentYear = (new Date).getFullYear();
				var winter = new Date(currentYear, 0, 1);
				var summer = new Date(currentYear, 6, 1);
				var winterOffset = winter.getTimezoneOffset();
				var summerOffset = summer.getTimezoneOffset();
				var stdTimezoneOffset = Math.max(winterOffset, summerOffset);
				GROWABLE_HEAP_U32()[timezone >>> 2 >>> 0] = stdTimezoneOffset * 60;
				GROWABLE_HEAP_I32()[daylight >>> 2 >>> 0] = Number(winterOffset != summerOffset);
				var extractZone = timezoneOffset => {
					var sign = timezoneOffset >= 0 ? "-" : "+";
					var absOffset = Math.abs(timezoneOffset);
					var hours = String(Math.floor(absOffset / 60)).padStart(2, "0");
					var minutes = String(absOffset % 60).padStart(2, "0");
					return `UTC${sign}${hours}${minutes}`
				};
				var winterName = extractZone(winterOffset);
				var summerName = extractZone(summerOffset);
				if (summerOffset < winterOffset) {
					stringToUTF8(winterName, std_name, 17);
					stringToUTF8(summerName, dst_name, 17)
				} else {
					stringToUTF8(winterName, dst_name, 17);
					stringToUTF8(summerName, std_name, 17)
				}
			};
			Module["__tzset_js"] = __tzset_js;
			var warnOnce = text => {
				warnOnce.shown ||= {};
				if (!warnOnce.shown[text]) {
					warnOnce.shown[text] = 1;
					if (ENVIRONMENT_IS_NODE) text = "warning: " + text;
					err(text)
				}
			};
			Module["warnOnce"] = warnOnce;
			var _emscripten_check_blocking_allowed = () => {};
			Module["_emscripten_check_blocking_allowed"] = _emscripten_check_blocking_allowed;
			var _emscripten_date_now = () => Date.now();
			Module["_emscripten_date_now"] = _emscripten_date_now;
			var runtimeKeepalivePush = () => {
				runtimeKeepaliveCounter += 1
			};
			Module["runtimeKeepalivePush"] = runtimeKeepalivePush;
			var _emscripten_exit_with_live_runtime = () => {
				runtimeKeepalivePush();
				throw "unwind"
			};
			Module["_emscripten_exit_with_live_runtime"] = _emscripten_exit_with_live_runtime;
			var getHeapMax = () => 4294901760;
			Module["getHeapMax"] = getHeapMax;

			function _emscripten_get_heap_max() {
				return getHeapMax()
			}
			Module["_emscripten_get_heap_max"] = _emscripten_get_heap_max;
			var _emscripten_num_logical_cores = () => ENVIRONMENT_IS_NODE ? require("os").cpus().length : navigator["hardwareConcurrency"];
			Module["_emscripten_num_logical_cores"] = _emscripten_num_logical_cores;
			var growMemory = size => {
				var b = wasmMemory.buffer;
				var pages = (size - b.byteLength + 65535) / 65536;
				try {
					wasmMemory.grow(pages);
					updateMemoryViews();
					return 1
				} catch (e) {}
			};
			Module["growMemory"] = growMemory;

			function _emscripten_resize_heap(requestedSize) {
				requestedSize >>>= 0;
				var oldSize = GROWABLE_HEAP_U8().length;
				if (requestedSize <= oldSize) {
					return false
				}
				var maxHeapSize = getHeapMax();
				if (requestedSize > maxHeapSize) {
					return false
				}
				for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
					var overGrownHeapSize = oldSize * (1 + .2 / cutDown);
					overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
					var newSize = Math.min(maxHeapSize, alignMemory(Math.max(requestedSize, overGrownHeapSize), 65536));
					var replacement = growMemory(newSize);
					if (replacement) {
						return true
					}
				}
				return false
			}
			Module["_emscripten_resize_heap"] = _emscripten_resize_heap;
			var ENV = {};
			Module["ENV"] = ENV;
			var getExecutableName = () => thisProgram || "./this.program";
			Module["getExecutableName"] = getExecutableName;
			var getEnvStrings = () => {
				if (!getEnvStrings.strings) {
					var lang = (typeof navigator == "object" && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8";
					var env = {
						USER: "web_user",
						LOGNAME: "web_user",
						PATH: "/",
						PWD: "/",
						HOME: "/home/web_user",
						LANG: lang,
						_: getExecutableName()
					};
					for (var x in ENV) {
						if (ENV[x] === undefined) delete env[x];
						else env[x] = ENV[x]
					}
					var strings = [];
					for (var x in env) {
						strings.push(`${x}=${env[x]}`)
					}
					getEnvStrings.strings = strings
				}
				return getEnvStrings.strings
			};
			Module["getEnvStrings"] = getEnvStrings;
			var stringToAscii = (str, buffer) => {
				for (var i = 0; i < str.length; ++i) {
					GROWABLE_HEAP_I8()[buffer++ >>> 0] = str.charCodeAt(i)
				}
				GROWABLE_HEAP_I8()[buffer >>> 0] = 0
			};
			Module["stringToAscii"] = stringToAscii;
			var _environ_get = function(__environ, environ_buf) {
				if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(15, 0, 1, __environ, environ_buf);
				__environ >>>= 0;
				environ_buf >>>= 0;
				var bufSize = 0;
				getEnvStrings().forEach((string, i) => {
					var ptr = environ_buf + bufSize;
					GROWABLE_HEAP_U32()[__environ + i * 4 >>> 2 >>> 0] = ptr;
					stringToAscii(string, ptr);
					bufSize += string.length + 1
				});
				return 0
			};
			Module["_environ_get"] = _environ_get;
			var _environ_sizes_get = function(penviron_count, penviron_buf_size) {
				if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(16, 0, 1, penviron_count, penviron_buf_size);
				penviron_count >>>= 0;
				penviron_buf_size >>>= 0;
				var strings = getEnvStrings();
				GROWABLE_HEAP_U32()[penviron_count >>> 2 >>> 0] = strings.length;
				var bufSize = 0;
				strings.forEach(string => bufSize += string.length + 1);
				GROWABLE_HEAP_U32()[penviron_buf_size >>> 2 >>> 0] = bufSize;
				return 0
			};
			Module["_environ_sizes_get"] = _environ_sizes_get;

			function _fd_close(fd) {
				if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(17, 0, 1, fd);
				try {
					var stream = SYSCALLS.getStreamFromFD(fd);
					FS.close(stream);
					return 0
				} catch (e) {
					if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
					return e.errno
				}
			}
			Module["_fd_close"] = _fd_close;
			var doReadv = (stream, iov, iovcnt, offset) => {
				var ret = 0;
				for (var i = 0; i < iovcnt; i++) {
					var ptr = GROWABLE_HEAP_U32()[iov >>> 2 >>> 0];
					var len = GROWABLE_HEAP_U32()[iov + 4 >>> 2 >>> 0];
					iov += 8;
					var curr = FS.read(stream, GROWABLE_HEAP_I8(), ptr, len, offset);
					if (curr < 0) return -1;
					ret += curr;
					if (curr < len) break;
					if (typeof offset != "undefined") {
						offset += curr
					}
				}
				return ret
			};
			Module["doReadv"] = doReadv;

			function _fd_read(fd, iov, iovcnt, pnum) {
				if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(18, 0, 1, fd, iov, iovcnt, pnum);
				iov >>>= 0;
				iovcnt >>>= 0;
				pnum >>>= 0;
				try {
					var stream = SYSCALLS.getStreamFromFD(fd);
					var num = doReadv(stream, iov, iovcnt);
					GROWABLE_HEAP_U32()[pnum >>> 2 >>> 0] = num;
					return 0
				} catch (e) {
					if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
					return e.errno
				}
			}
			Module["_fd_read"] = _fd_read;

			function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
				if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(19, 0, 1, fd, offset_low, offset_high, whence, newOffset);
				var offset = convertI32PairToI53Checked(offset_low, offset_high);
				newOffset >>>= 0;
				try {
					if (isNaN(offset)) return 61;
					var stream = SYSCALLS.getStreamFromFD(fd);
					FS.llseek(stream, offset, whence);
					tempI64 = [stream.position >>> 0, (tempDouble = stream.position, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], GROWABLE_HEAP_I32()[newOffset >>> 2 >>> 0] = tempI64[0], GROWABLE_HEAP_I32()[newOffset + 4 >>> 2 >>> 0] = tempI64[1];
					if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null;
					return 0
				} catch (e) {
					if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
					return e.errno
				}
			}
			Module["_fd_seek"] = _fd_seek;
			var doWritev = (stream, iov, iovcnt, offset) => {
				var ret = 0;
				for (var i = 0; i < iovcnt; i++) {
					var ptr = GROWABLE_HEAP_U32()[iov >>> 2 >>> 0];
					var len = GROWABLE_HEAP_U32()[iov + 4 >>> 2 >>> 0];
					iov += 8;
					var curr = FS.write(stream, GROWABLE_HEAP_I8(), ptr, len, offset);
					if (curr < 0) return -1;
					ret += curr;
					if (curr < len) {
						break
					}
					if (typeof offset != "undefined") {
						offset += curr
					}
				}
				return ret
			};
			Module["doWritev"] = doWritev;

			function _fd_write(fd, iov, iovcnt, pnum) {
				if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(20, 0, 1, fd, iov, iovcnt, pnum);
				iov >>>= 0;
				iovcnt >>>= 0;
				pnum >>>= 0;
				try {
					var stream = SYSCALLS.getStreamFromFD(fd);
					var num = doWritev(stream, iov, iovcnt);
					GROWABLE_HEAP_U32()[pnum >>> 2 >>> 0] = num;
					return 0
				} catch (e) {
					if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
					return e.errno
				}
			}
			Module["_fd_write"] = _fd_write;
			var stringToUTF8OnStack = str => {
				var size = lengthBytesUTF8(str) + 1;
				var ret = stackAlloc(size);
				stringToUTF8(str, ret, size);
				return ret
			};
			Module["stringToUTF8OnStack"] = stringToUTF8OnStack;
			var FS_createPath = FS.createPath;
			Module["FS_createPath"] = FS_createPath;
			var FS_unlink = path => FS.unlink(path);
			Module["FS_unlink"] = FS_unlink;
			var FS_createLazyFile = FS.createLazyFile;
			Module["FS_createLazyFile"] = FS_createLazyFile;
			var FS_createDevice = FS.createDevice;
			Module["FS_createDevice"] = FS_createDevice;
			PThread.init();
			FS.createPreloadedFile = FS_createPreloadedFile;
			FS.staticInit();
			Module["FS_createPath"] = FS.createPath;
			Module["FS_createDataFile"] = FS.createDataFile;
			Module["FS_createPreloadedFile"] = FS.createPreloadedFile;
			Module["FS_unlink"] = FS.unlink;
			Module["FS_createLazyFile"] = FS.createLazyFile;
			Module["FS_createDevice"] = FS.createDevice;
			var proxiedFunctionTable = [_proc_exit, exitOnMainThread, pthreadCreateProxied, ___syscall_fcntl64, ___syscall_fstat64, ___syscall_ioctl, ___syscall_lstat64, ___syscall_mkdirat, ___syscall_newfstatat, ___syscall_openat, ___syscall_stat64, __emscripten_runtime_keepalive_clear, __mmap_js, __munmap_js, __setitimer_js, _environ_get, _environ_sizes_get, _fd_close, _fd_read, _fd_seek, _fd_write];
			var wasmImports;

			function assignWasmImports() {
				wasmImports = {
					s: ___call_sighandler,
					b: ___cxa_throw,
					B: ___pthread_create_js,
					j: ___syscall_fcntl64,
					d: ___syscall_ioctl,
					F: ___syscall_mkdirat,
					k: ___syscall_openat,
					A: ___syscall_stat64,
					v: __abort_js,
					n: __emscripten_get_now_is_monotonic,
					H: __emscripten_init_main_thread_js,
					x: __emscripten_notify_mailbox_postmessage,
					C: __emscripten_receive_on_main_thread_js,
					t: __emscripten_runtime_keepalive_clear,
					g: __emscripten_thread_cleanup,
					G: __emscripten_thread_mailbox_await,
					m: __emscripten_thread_set_strongref,
					q: __localtime_js,
					o: __mmap_js,
					p: __munmap_js,
					u: __setitimer_js,
					D: __tzset_js,
					h: _emscripten_check_blocking_allowed,
					f: _emscripten_date_now,
					l: _emscripten_exit_with_live_runtime,
					y: _emscripten_get_heap_max,
					c: _emscripten_get_now,
					z: _emscripten_num_logical_cores,
					w: _emscripten_resize_heap,
					I: _environ_get,
					J: _environ_sizes_get,
					e: _exit,
					i: _fd_close,
					L: _fd_read,
					r: _fd_seek,
					K: _fd_write,
					a: wasmMemory,
					E: _proc_exit
				}
			}
			var wasmExports = createWasm();
			var ___wasm_call_ctors = () => (___wasm_call_ctors = wasmExports["M"])();
			var _main = Module["_main"] = (a0, a1) => (_main = Module["_main"] = wasmExports["N"])(a0, a1);
			var _pthread_self = () => (_pthread_self = wasmExports["O"])();
			var __emscripten_tls_init = () => (__emscripten_tls_init = wasmExports["P"])();
			var _emscripten_builtin_memalign = (a0, a1) => (_emscripten_builtin_memalign = wasmExports["Q"])(a0, a1);
			var __emscripten_thread_init = (a0, a1, a2, a3, a4, a5) => (__emscripten_thread_init = wasmExports["S"])(a0, a1, a2, a3, a4, a5);
			var __emscripten_thread_crashed = () => (__emscripten_thread_crashed = wasmExports["T"])();
			var _emscripten_main_thread_process_queued_calls = () => (_emscripten_main_thread_process_queued_calls = wasmExports["U"])();
			var _emscripten_main_runtime_thread_id = () => (_emscripten_main_runtime_thread_id = wasmExports["V"])();
			var __emscripten_run_on_main_thread_js = (a0, a1, a2, a3, a4) => (__emscripten_run_on_main_thread_js = wasmExports["W"])(a0, a1, a2, a3, a4);
			var __emscripten_thread_free_data = a0 => (__emscripten_thread_free_data = wasmExports["X"])(a0);
			var __emscripten_thread_exit = a0 => (__emscripten_thread_exit = wasmExports["Y"])(a0);
			var __emscripten_timeout = (a0, a1) => (__emscripten_timeout = wasmExports["Z"])(a0, a1);
			var __emscripten_check_mailbox = () => (__emscripten_check_mailbox = wasmExports["_"])();
			var __emscripten_tempret_set = a0 => (__emscripten_tempret_set = wasmExports["$"])(a0);
			var _emscripten_stack_set_limits = (a0, a1) => (_emscripten_stack_set_limits = wasmExports["aa"])(a0, a1);
			var __emscripten_stack_restore = a0 => (__emscripten_stack_restore = wasmExports["ba"])(a0);
			var __emscripten_stack_alloc = a0 => (__emscripten_stack_alloc = wasmExports["ca"])(a0);
			var _emscripten_stack_get_current = () => (_emscripten_stack_get_current = wasmExports["da"])();
			var ___cxa_increment_exception_refcount = a0 => (___cxa_increment_exception_refcount = wasmExports["ea"])(a0);
			var dynCall_jiji = Module["dynCall_jiji"] = (a0, a1, a2, a3, a4) => (dynCall_jiji = Module["dynCall_jiji"] = wasmExports["fa"])(a0, a1, a2, a3, a4);
			var dynCall_viijii = Module["dynCall_viijii"] = (a0, a1, a2, a3, a4, a5, a6) => (dynCall_viijii = Module["dynCall_viijii"] = wasmExports["ga"])(a0, a1, a2, a3, a4, a5, a6);
			var dynCall_iiiiij = Module["dynCall_iiiiij"] = (a0, a1, a2, a3, a4, a5, a6) => (dynCall_iiiiij = Module["dynCall_iiiiij"] = wasmExports["ha"])(a0, a1, a2, a3, a4, a5, a6);
			var dynCall_iiiiijj = Module["dynCall_iiiiijj"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8) => (dynCall_iiiiijj = Module["dynCall_iiiiijj"] = wasmExports["ia"])(a0, a1, a2, a3, a4, a5, a6, a7, a8);
			var dynCall_iiiiiijj = Module["dynCall_iiiiiijj"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) => (dynCall_iiiiiijj = Module["dynCall_iiiiiijj"] = wasmExports["ja"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);

			function applySignatureConversions(wasmExports) {
				wasmExports = Object.assign({}, wasmExports);
				var makeWrapper_p = f => () => f() >>> 0;
				var makeWrapper_ppp = f => (a0, a1) => f(a0, a1) >>> 0;
				var makeWrapper_pp = f => a0 => f(a0) >>> 0;
				wasmExports["O"] = makeWrapper_p(wasmExports["O"]);
				wasmExports["Q"] = makeWrapper_ppp(wasmExports["Q"]);
				wasmExports["V"] = makeWrapper_p(wasmExports["V"]);
				wasmExports["ca"] = makeWrapper_pp(wasmExports["ca"]);
				wasmExports["da"] = makeWrapper_p(wasmExports["da"]);
				return wasmExports
			}
			Module["addRunDependency"] = addRunDependency;
			Module["removeRunDependency"] = removeRunDependency;
			Module["callMain"] = callMain;
			Module["FS_createPreloadedFile"] = FS_createPreloadedFile;
			Module["FS_unlink"] = FS_unlink;
			Module["FS_createPath"] = FS_createPath;
			Module["FS_createDevice"] = FS_createDevice;
			Module["FS_createDataFile"] = FS_createDataFile;
			Module["FS_createLazyFile"] = FS_createLazyFile;
			var calledRun;
			dependenciesFulfilled = function runCaller() {
				if (!calledRun) run();
				if (!calledRun) dependenciesFulfilled = runCaller
			};

			function callMain(args = []) {
				var entryFunction = _main;
				args.unshift(thisProgram);
				var argc = args.length;
				var argv = stackAlloc((argc + 1) * 4);
				var argv_ptr = argv;
				args.forEach(arg => {
					GROWABLE_HEAP_U32()[argv_ptr >>> 2 >>> 0] = stringToUTF8OnStack(arg);
					argv_ptr += 4
				});
				GROWABLE_HEAP_U32()[argv_ptr >>> 2 >>> 0] = 0;
				try {
					var ret = entryFunction(argc, argv);
					exitJS(ret, true);
					return ret
				} catch (e) {
					return handleException(e)
				}
			}

			function run(args = arguments_) {
				if (runDependencies > 0) {
					return
				}
				if (ENVIRONMENT_IS_PTHREAD) {
					readyPromiseResolve(Module);
					initRuntime();
					startWorker(Module);
					return
				}
				preRun();
				if (runDependencies > 0) {
					return
				}

				function doRun() {
					if (calledRun) return;
					calledRun = true;
					Module["calledRun"] = true;
					if (ABORT) return;
					initRuntime();
					preMain();
					readyPromiseResolve(Module);
					Module["onRuntimeInitialized"]?.();
					if (shouldRunNow) callMain(args);
					postRun()
				}
				if (Module["setStatus"]) {
					Module["setStatus"]("Running...");
					setTimeout(function() {
						setTimeout(function() {
							Module["setStatus"]("")
						}, 1);
						doRun()
					}, 1)
				} else {
					doRun()
				}
			}
			if (Module["preInit"]) {
				if (typeof Module["preInit"] == "function") Module["preInit"] = [Module["preInit"]];
				while (Module["preInit"].length > 0) {
					Module["preInit"].pop()()
				}
			}
			var shouldRunNow = true;
			if (Module["noInitialRun"]) shouldRunNow = false;
			run();
			moduleRtn = readyPromise;


			return moduleRtn;
		}
	);
})();
export default Module;
var isPthread = globalThis.self?.name === 'em-pthread';
var isNode = typeof globalThis.process?.versions?.node == 'string';
if (isNode) isPthread = (await import('worker_threads')).workerData === 'em-pthread';

// When running as a pthread, construct a new instance on startup
isPthread && Module();
