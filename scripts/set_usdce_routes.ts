import { updateLiquidator } from "utils/tasks";

async function main() {
  try {
    await updateLiquidator();
  } catch (err) {
    console.error(err);
    return process.exit(1);
  }
}

main()

