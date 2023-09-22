import * as which from "which";

export const isGraphvizInstalled = async () => {
  return (await which("dot", { nothrow: true })) !== null;
};
