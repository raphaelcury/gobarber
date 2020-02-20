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
}

export default new NotificationController();
