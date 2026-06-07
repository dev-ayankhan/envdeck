
import { z } from "zod";
export default z.object({
  API_URL: z.string().url(),
  PORT: z.coerce.number().default(3000)
});
      