import { CLI } from '../../../../FlowHelpers/1.0.0/cliUtils';
import { checkFfmpegCommandInit } from '../../../../FlowHelpers/1.0.0/interfaces/flowUtils';
import {
  IpluginDetails,
  IpluginInputArgs,
  IpluginOutputArgs,
} from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';
import { getContainer, getFileName, getPluginWorkDir } from '../../../../FlowHelpers/1.0.0/fileUtils';

/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = (): IpluginDetails => ({
  name: 'Detect Cropbar',
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
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const plugin = async (args: IpluginInputArgs): Promise<IpluginOutputArgs> => {

function findMode(array: number[]): number {
  const counts: Record<number, number> = {};

  for (const num of array) {
    counts[num] = (counts[num] || 0) + 1;
  }

  let maxCount = -1;
  let mode: number = array[0];

  for (const key in counts) {
    const count = counts[Number(key)];
    if (count > maxCount) {
      maxCount = count;
      mode = Number(key);
    }
  }

  return mode;
}

  const lib = require('../../../../../methods/lib')();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
  args.inputs = lib.loadDefaultValues(args.inputs, details);

  const basicSettingsType = String(args.inputs.basicSettingsType);
  const container = String(args.inputs.outputFileContainer).split('.').join('');
  const cliTool = String(args.inputs.cliTool);
  const cliArguments = String(args.inputs.cliArguments);

  const outputFilePath = `/dev/null`;

  let cliArgs:string[] = [];
  let cliPath = '';
  //let crops:string[] = [];
  cliPath = args.ffmpegPath;
  let argsSplit;
  if (cliArguments.includes('<io>')) {
    argsSplit = cliArguments.split('<io>');
  } else {
    argsSplit = cliArguments.split(',');
  }

  cliArgs = [
    '-ss',
    `${args.inputs.startingSecond}`,
    '-i',
    `${args.inputFileObj._id}`,
    '-t',
    `${args.inputs.Duration}`,
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

  const cli = new CLI({
    cli: cliPath,
    spawnArgs: cliArgs,
    spawnOpts: {},
    jobLog: args.jobLog,
    outputFilePath,
    inputFileObj: args.inputFileObj,
    logFullCliOutput: args.logFullCliOutput,
    updateWorker: args.updateWorker,
    args,
  });

  const res = await cli.runCli();

  if (res.cliExitCode !== 0) {
    args.jobLog(`Running ${cliTool} failed`);
    throw new Error(`Running ${cliTool} failed`);
  }
  else {
    // Extract crop values from output using regex
    const crops: string[] = (res.errorLogFull.toString().match(/crop=\S+/g) || [])
         .map((crop: string) => crop.substring(5));

    //Get the most commonly returned number and set that as the crop value
    //ffmpeg returns 4 values for cropdetect: width:height:x:y
    var crop_w_mode = [];
    var crop_h_mode = [];
    var crop_x_mode = [];
    var crop_y_mode = [];
    for (var c = 0; c < (crops ?? []).length; c++) {
        const crop = String(crops[c]).split(':');
        crop_w_mode.push(parseInt(crop[0]));
        crop_h_mode.push(parseInt(crop[1]));
        crop_x_mode.push(parseInt(crop[2]));
        crop_y_mode.push(parseInt(crop[3]));
    }
    const wMode = findMode(crop_w_mode);
    const hMode = findMode(crop_h_mode);
    const xMode = findMode(crop_x_mode);
    const yMode = findMode(crop_y_mode);

    // Return a dict of the crop values
    args.jobLog(`${wMode},${hMode},${xMode},${yMode}`);
    checkFfmpegCommandInit(args);

    args.variables.ffmpegCommand.streams.forEach((stream) => {
      if (stream.codec_type === 'video') {
        stream.outputArgs.push('-vf', `crop=${wMode}:${hMode}:${xMode}:${yMode}`);
    }});
  };



  args.logOutcome('tSuc');

  return {
    outputFileObj: {
      _id: args.inputFileObj._id,
    },
    outputNumber: 1,
    variables: args.variables,
  };
};
export {
  details,
  plugin,
};
