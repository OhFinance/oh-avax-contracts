import { updateManager } from "utils/tasks";

async function main() {
  try {
    await updateManager();    
  } catch (err) {
    console.error(err);
    return process.exit(1);
  }
}

main()

