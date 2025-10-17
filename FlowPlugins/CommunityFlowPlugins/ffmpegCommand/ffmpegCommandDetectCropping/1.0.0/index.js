"use strict";
function findMode(array) {
  // This function starts by creating an object where the keys are each unique number of the array and the values are the amount of times that number appears in the array.

  let object = {};

  for (let i = 0; i < array.length; i++) {
    if (object[array[i]]) {
      // increment existing key's value
      object[array[i]] += 1;
    } else {
      // make a new key and set its value to 1
      object[array[i]] = 1;
    };
  };

  // assign a value guaranteed to be smaller than any number in the array
  let biggestValue = -1;
  let biggestValuesKey = -1;

  // finding the biggest value and its corresponding key
  Object.keys(object).forEach(key => {
    let value = object[key];
    if (value > biggestValue) {
      biggestValue = value;
      biggestValuesKey = key;
    };
  });

  return biggestValuesKey;

};

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
var cliUtils_1 = require("../../../../FlowHelpers/1.0.0/cliUtils");
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
var details = function () { return ({
    name: 'Detecting Cropbar',
    description: 'Detect cropbar with ffmpeg and ad it to the -vf option',
    style: {
        borderColor: 'green',
    },
    tags: '',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.11.01',
    sidebarPosition: -1,
    icon: '',
    inputs: [
        {
            label: 'Starting Second',
            name: 'startingSecond',
            type: 'string',
            defaultValue: '120',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Second at which to start detecting, ( "-ss" options in ffmpeg ) Default is 120 second ',
        },
        {
            label: 'Duration',
            name: 'Duration',
            type: 'string',
            defaultValue: '9:00',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Duration to check, ( "-t" options in ffmpeg ) Default is 9:00 ',
        },
    ],
    outputs: [
        {
            number: 1,
            tooltip: 'Continue to next plugin',
        },
    ],
}); };
exports.details = details;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
var plugin = function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var lib, basicSettingsType, container, cliTool, cliArguments, mainStream, outputFilePath, cliArgs, cliPath, argsSplit, cli, res, crops, crop_w_mode, crop_h_mode, crop_x_mode, crop_y_mode, c, crop;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                lib = require('../../../../../methods/lib')();
                // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
                args.inputs = lib.loadDefaultValues(args.inputs, details);
                basicSettingsType = String(args.inputs.basicSettingsType);
                container = String(args.inputs.outputFileContainer).split('.').join('');
                cliTool = String(args.inputs.cliTool);
                cliArguments = String(args.inputs.cliArguments);
                //  const noTranscodeResponse = {
                //    outputFileObj: {
                //      _id: args.inputFileObj._id,
                //    },
                //    outputNumber: 1,
                //    variables: args.variables,
                //  };
/*                if (!args.inputFileObj.ffProbeData.streams) {
                    throw new Error('No streams found in file FFprobe data');
                }
                mainStream = args.inputFileObj.ffProbeData.streams.find(function (stream) { return stream.codec_type === basicSettingsType; });
                if (!mainStream) {
                    throw new Error("No ".concat(basicSettingsType, " stream found in file FFprobe data"));
                }*/
                outputFilePath = "/dev/null";
                cliArgs = [];
                cliPath = '';
                //let crops:string[] = [];
                cliPath = args.ffmpegPath;
                if (cliArguments.includes('<io>')) {
                    argsSplit = cliArguments.split('<io>');
                }
                else {
                    argsSplit = cliArguments.split(',');
                }
                cliArgs = [
                    '-ss',
                    "".concat(args.inputs.startingSecond),
                    '-i',
                    "".concat(args.inputFileObj._id),
                    '-t',
                    "".concat(args.inputs.Duration),
                    '-vf',
                    'fps=1/2,cropdetect',
                    '-f',
                    'null',
                    '-',
                ];
                args.updateWorker({
                    CLIType: cliPath,
                    preset: cliArgs.join(' '),
                });
                cli = new cliUtils_1.CLI({
                    cli: cliPath,
                    spawnArgs: cliArgs,
                    spawnOpts: {},
                    jobLog: args.jobLog,
                    outputFilePath: outputFilePath,
                    inputFileObj: args.inputFileObj,
                    logFullCliOutput: args.logFullCliOutput,
                    updateWorker: args.updateWorker,
                    args: args,
                });
                return [4 /*yield*/, cli.runCli()];
            case 1:
                res = _a.sent();
                if (res.cliExitCode !== 0) {
                    args.jobLog("Running ".concat(cliTool, " failed"));
                    throw new Error("Running ".concat(cliTool, " failed"));
                }
                else {
                        const crops = res.errorLogFull
                             .toString()
                             .match(/crop=\S+/g)
                             .map((crop) => crop.substring(5));
                    crop_w_mode = [];
                    crop_h_mode = [];
                    crop_x_mode = [];
                    crop_y_mode = [];
                    for (c = 0; c < (crops !== null && crops !== void 0 ? crops : []).length; c++) {
                        crop = String(crops[c]).split(':');
                        crop_w_mode.push(parseInt(crop[0]));
                        crop_h_mode.push(parseInt(crop[1]));
                        crop_x_mode.push(parseInt(crop[2]));
                        crop_y_mode.push(parseInt(crop[3]));
                    }
                    args.jobLog(`testing output : ${crops}` );
                        const wMode = findMode(crop_w_mode);
                        const hMode = findMode(crop_h_mode);
                        const xMode = findMode(crop_x_mode);
                        const yMode = findMode(crop_y_mode);
                    // Return a dict of the crop values
                        args.jobLog(`${wMode},${hMode},${xMode},${yMode}`);
//                        const cropping = {wMode','hMode','xMode','yMode};
                }
                ;
                args.logOutcome('tSuc');
                return [2 /*return*/, {
                        outputFileObj: {
                            _id: args.inputFileObj._id,
                        },
                        outputNumber: 1,
                        variables: args.variables,
                    }];
        }
    });
}); };
exports.plugin = plugin;
