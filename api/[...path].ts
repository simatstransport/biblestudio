import app from '../server/dist/index.js';

export default function handler(req: any, res: any) {
  return app(req, res);
}
