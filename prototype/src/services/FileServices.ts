import { Choreography, Pattern, StandardPattern } from '../interfaces/Choreography';

export async function fetchChoreography(filePath:string) {
  return new Promise<Choreography>((resolve) =>
    fetch(filePath)
      .then((res) => res.json())
      .then((result) => {
        resolve(result);
      }),
  );
}

export async function getStandardPattern(standardPattern: string) {
  return new Promise<Pattern>((resolve) =>
  fetch(standardPattern)
    .then((res) => res.json())
    .then((result) => {
      resolve(result);
    }),
);
}

export async function saveChoreography(filePath:string, choreo:Choreography) {
  fetch(filePath, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(choreo),
})
  .then((response) => console.log(response))
}

