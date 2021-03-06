import Notification from '../schemas/Notification';

const PAGE_SIZE = 20;

class NotificationController {
  async index(req, res) {
    const notifications = await Notification.find({
      userId: req.userId,
    })
      .sort({ createdAt: 'desc' })
      .limit(PAGE_SIZE);
    return res.json(notifications);
  }

  async update(req, res) {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    return res.json(notification);
  }
}

export default new NotificationController();
