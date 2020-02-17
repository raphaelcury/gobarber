import File from '../models/File';

class FileController {
  async store(req, res) {
    try {
      const { originalname, filename } = req.file;
      const file = await File.create({
        name: originalname,
        path: filename,
      });
      return res.json(file);
    } catch (error) {
      return res.status(500).json({ error });
    }
  }
}

export default new FileController();
