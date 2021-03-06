import { Array1DTracer, LogTracer } from 'algorithm-visualizer';

function randString(length) {
  const result = Math.random().toString(36);
  return result.substring(result.length - length);
}

const string = randString(15);

const startIndex = Math.floor(Math.random() * 10); // Random start index from 0 to 9
const substring = string.substr(startIndex, 5); // Substring of `string` of length 5

// let string = 'abcxabcdabxabcdabcdabxabcda', substring = 'xabcda';
// let string = 'abcxabcdabxabcdabcdabcyiuhsiuhduiahdubhbuuabcdabcysbhbh', substring = 'abcdabcy';

let track = Array(...Array(substring.length)).map(Number.prototype.valueOf, 0);

const trackTracer = new Array1DTracer('Tracker');
const substrTracer = new Array1DTracer('Substring');
const stringTracer = new Array1DTracer('Major String');
const logger = new LogTracer();

trackTracer.set(track);
substrTracer.set(substring);
stringTracer.set(string).delay();

// Fix JS Negative number modulo Bug
Number.prototype.mod = function (n) {
  return ((this % n) + n) % n;
};

function tracker(substring) {
  let i = 1;
  let j = 0;

  logger.print('Initializing i to 1, j to 0.');
  substrTracer.select(j);
  while (i < track.length) {
    substrTracer.select(i).delay();

    while ((substring[i] !== substring[j]) && (j > 0)) {
      logger.print(`j = ${track[j - 1]}`);
      trackTracer.select(j - 1).delay();
      trackTracer.deselect(j - 1).delay();

      substrTracer.deselect(j);
      j = track[j - 1];
      logger.print(`j = ${j}`);
      substrTracer.select(j);
    }

    if (substring[i] === substring[j]) {
      substrTracer.deselect(j);
      track[i] = ++j;
      trackTracer.patch(i, track[i]).delay();
      trackTracer.depatch(i).delay();
      logger.print(`substring [ ${i} ] (${substring[i]}) equals substring [ ${j} ] (${substring[j]}), track [ ${i} ] updated to: ${track[i]}`);

      logger.print(`j = ${j}`);
      substrTracer.select(j);
    } else {
      track[i] = 0;
      logger.print(`substring [ ${i} ] (${substring[i]}) is not equal to substring [ ${j} ] (${substring[j]}), setting track [${i}] to 0`);
      trackTracer.select(i).delay();
      trackTracer.deselect(i).delay();
    }

    substrTracer.deselect(i).delay();
    i++;
    logger.print(`i = ${i}`);
  }

  return track;
}

function kmp(string, substr) {
  const positions = [];
  let j = 0;
  let startPos;

  logger.print(`Constructing Tracker for substring <b>${substr}</b>`);
  track = tracker(substr);
  logger.print(`Tracker for substring constructed: [ ${String(track)} ]`);
  logger.print('--------------------------------------------------------------------------');
  logger.print('Running KMP...');

  logger.print('Initializing i = 0, j = 0');
  for (let i = 0; i < string.length; i++) {
    logger.print(`comparing string [${i}] (${string[i]}) and substring [${j}] (${substr[j]})...`);
    stringTracer.select(i).delay();
    stringTracer.select(j).delay();

    if (string[i] === substr[j]) {
      logger.print('they\'re equal!');

      if (j === substr.length - 1) {
        logger.print(`j (${j}) equals length of substring - 1 (${substr.length}-1), we've found a new match in the string!`);
        startPos = i - substr.length + 1;
        positions.push(startPos);

        logger.print(`Adding start position of the substring (${startPos}) to the results.`);
        stringTracer.select(startPos).delay();
      } else {
        stringTracer.deselect(j).delay();
        logger.print(`But j (${j}) does not equal length of substring (${substr.length}) Incrementing j and moving forward.`);
        j++;
        logger.print(`j = ${j}`);
        stringTracer.select(j).delay();
      }
    } else {
      const tempJ = j - 1;
      logger.print('they\'re NOT equal');
      trackTracer.select(tempJ).delay();
      stringTracer.deselect(j).delay();

      j = track[(j - 1).mod(substr.length)]; // use modulo to wrap around, i.e., if index = -1, access the LAST element of array (PYTHON-LIKE)

      logger.print(`Setting j to ${j}`);
      stringTracer.select(j).delay();
      trackTracer.deselect(tempJ).delay();
    }

    stringTracer.deselect(i).delay();
  }

  return positions;
}

const positions = kmp(string, substring);

logger.print(`Substring positions are: ${positions.length ? String(positions) : 'NONE'}`);
for (let i = 0; i < positions.length; i++) {
  stringTracer.select(positions[i], positions[i] + substring.length - 1).delay();
}
