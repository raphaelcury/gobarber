import Notification from '../schemas/Notification';

const pageSize = 20;

class NotificationController {
  async index(req, res) {
    const notifications = await Notification.find({
      userId: req.userId,
    })
      .sort({ createdAt: 'desc' })
      .limit(pageSize);
    return res.json(notifications);
  }

  async update(req, res) {
    try {
      const notification = await Notification.findByIdAndUpdate(
        req.params.id,
        { read: true },
        { new: true }
      );
      return res.json(notification);
    } catch (error) {
      return res.status(500).json({ error });
    }
  }
}

export default new NotificationController();
