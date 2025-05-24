const mongoose = require('mongoose');
const {Automation} = require('../model/automodel');

exports.deleteall = async () => {
    return await Automation.deleteMany ();
};

exports.create = async (AutomationData) => {
    const {form_name, form_page_name, form_url_pattern, fields:{fields_name, fields_type, fields_selector}, identfier} = AutomationData;

    return await Automation.create ({
        form_name,
        form_page_name,
        form_url_pattern,
        fields: {
            fields_name,
            fields_type,
            fields_selector
        },
        created_at,
        identfier
    });
};

exports.getAllAutomation = async () => {
    return await Automation.find ();
};

exports.updateAutomation = async (id, AutomationData) => {
    const {form_name, form_page_name, form_url_pattern, fields:{fields_name, fields_type, fields_selector}, created_at, identfier} = AutomationData;
    return await Automation.findByidAndUpdate (
        id,
        {
            form_name,
            form_page_name,
            form_url_pattern,
            fields: {
                fields_name,
                fields_type,
                fields_selector
            },
            identfier
        },

        { new: true, runValidators: true }
    );
};
exports.getAutomationById = async (id) => {
    return await Automation.findById (id);
};

exports.deleteAutomation = async (id) => {
    return await Automation.findByIdAndDelete (id);
}   