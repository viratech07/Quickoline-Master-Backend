const AutomationService = require('../services/automationService');

exports.createAutomation = async (req, res) => {
    try {
        const createdAutomation = await AutomationService.create(req.body,);
        res.status(201).json(createdAutomation);
    } catch (error) {
        res.status(500).json({ message: 'Error creating automation', error });
    }
};

exports.getAllAutomations = async (req, res) => {
    try {
        const automations = await AutomationService.getAllAutomation();
        res.status(200).json(automations);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching automations', error });
    }
};


exports.getAutomationById = async (req, res) => {
    try {
        const automation = await AutomationService.getAutomationById(req.params.id);
        res.status(200).json(automation);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching automation', error });
    }
};

exports.updateAutomation = async (req, res) => {
    try {
        const updatedAutomation = await AutomationService.updateAutomation(req.params.id, req.body);
            return res.status(404).json({ message: 'Automation not found' });
        res.status(200).json(updatedAutomation);
    } catch (error) {
        res.status(500).json({ message: 'Error updating automation', error });
    }
};

exports.deleteAutomation = async (req, res) => {
    try {
        const deletedAutomation = await AutomationService.deleteAutomation(req.params.id);
        if (!deletedAutomation) {
            return res.status(404).json({ message: 'Automation not found' });
        }
        res.status(200).json({ message: 'Automation deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting automation', error });
    }
};

exports.deleteAllAutomations = async (req, res) => {
    try {
        await AutomationService.deleteall();
        res.status(200).json({ message: 'All automations deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting all automations', error });
    }
};
