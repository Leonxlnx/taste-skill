// Limit a checker and stop only the process tree it starts on Windows.
import {spawn, spawnSync} from 'node:child_process';

export function runCheck(args, cwd, limit) {
  return new Promise(resolve => {
    const child = spawn(process.execPath, args, {
      cwd, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe']
    });
    let stdout = '', stderr = '', error = null, timedOut = false, forceStop;
    child.stdout.setEncoding('utf8').on('data', chunk => { stdout += chunk; });
    child.stderr.setEncoding('utf8').on('data', chunk => { stderr += chunk; });
    child.on('error', cause => { error = cause; });

    const timer = setTimeout(() => {
      timedOut = true;
      if (process.platform === 'win32') {
        spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], {stdio: 'ignore', windowsHide: true});
      } else {
        child.kill('SIGTERM');
        forceStop = setTimeout(() => child.kill('SIGKILL'), 10000);
      }
    }, limit);
    child.on('close', status => {
      clearTimeout(timer);
      clearTimeout(forceStop);
      if (timedOut && !error) error = new Error(`stopped after ${limit} milliseconds`);
      resolve({status, stdout, stderr, timedOut, error});
    });
  });
}
