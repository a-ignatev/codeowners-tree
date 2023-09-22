import * as fs from "fs";

export function getCodeownersTeams(codeownersPath: string) {
  const codeowners = fs.readFileSync(codeownersPath, "utf-8");

  const teams = new Set<string>();

  codeowners.split("\n").map((line) => {
    const lineWithoutComment =
      line.indexOf("#") >= 0
        ? line.substring(0, line.indexOf("#")).trimEnd()
        : line;

    if (!lineWithoutComment) {
      return;
    }

    const [, ...owners] = lineWithoutComment.split(/\s+/);

    owners.forEach((owner) => {
      teams.add(owner);
    });
  });

  return teams;
}
