const User = require('../models/user.js');
const Auth = require('../../Authentication/models/user.js'); // Add this import

class UserService {
    // Profile Management
    async createProfile(authId, userData) {
        try {
            if (userData.profilePicture) {
                userData.profilePicture = userData.profilePicture.hash || userData.profilePicture.url;
            }
            
            // Create profile with auth reference
            const user = await User.createProfile(authId, userData);
            return await user.getFullProfile();
        } catch (error) {
            throw new Error(`Error creating profile: ${error.message}`);
        }
    }

    async updateProfile(authId, updateData) {
        try {
            if (updateData.profilePicture) {
                updateData.profilePicture = updateData.profilePicture.hash || updateData.profilePicture.url;
            }

            const user = await User.findOneAndUpdate(
                { authId },
                updateData,
                { new: true, runValidators: true }
            );

            if (!user) {
                throw new Error('User not found');
            }

            // Sync with auth if email or whatsapp was updated in auth collection
            if (updateData.email || updateData.whatsappNumber) {
                await user.syncWithAuth();
            }

            return await user.getFullProfile();
        } catch (error) {
            throw new Error(`Error updating profile: ${error.message}`);
        }
    }

    async getProfile(authId) {
        try {
            const user = await User.findByAuthId(authId);
            if (!user) {
                throw new Error('User not found');
            }
            return await user.getFullProfile();
        } catch (error) {
            throw new Error(`Error fetching profile: ${error.message}`);
        }
    }

    // Referral Management
    async applyReferralCode(authId, referralCode) {
        try {
            const referrer = await User.findOne({ referCode: referralCode });
            if (!referrer) {
                throw new Error('Invalid referral code');
            }

            const user = await User.findOne({ authId });
            if (!user) {
                throw new Error('User not found');
            }

            if (user.referredBy) {
                throw new Error('Referral code already applied');
            }

            // Update referrer
            await User.findByIdAndUpdate(referrer._id, {
                $inc: { referralRewards: 100 }, // Example reward amount
                $push: { referredUsers: user._id }
            });

            // Update referred user
            const updatedUser = await User.findByIdAndUpdate(user._id, {
                referredBy: referrer._id,
                $inc: { referralRewards: 50 } // Example reward amount
            }, { new: true });

            return await updatedUser.getFullProfile();
        } catch (error) {
            throw new Error(`Error applying referral: ${error.message}`);
        }
    }

    // Feedback Management
    async submitFeedback(authId, feedbackData) {
        try {
            const user = await User.findOne({ authId });
            if (!user) {
                throw new Error('User not found');
            }

            user.feedbacks.push({
                ...feedbackData,
                userId: user._id
            });
            await user.save();
            return await user.getFullProfile();
        } catch (error) {
            throw new Error(`Error submitting feedback: ${error.message}`);
        }
    }

    async updateFeedback(authId, feedbackId, updateData) {
        try {
            const user = await User.findOneAndUpdate(
                { 
                    authId, 
                    'feedbacks._id': feedbackId 
                },
                { 
                    $set: { 'feedbacks.$': updateData } 
                },
                { new: true }
            );
            return await user.getFullProfile();
        } catch (error) {
            throw new Error(`Error updating feedback: ${error.message}`);
        }
    }

    // Contact Management
    async submitContact(authId, contactData) {
        try {
            const user = await User.findOne({ authId });
            if (!user) {
                throw new Error('User not found');
            }

            user.contacts.push(contactData);
            await user.save();
            return await user.getFullProfile();
        } catch (error) {
            throw new Error(`Error submitting contact: ${error.message}`);
        }
    }

    async updateContact(authId, contactId, updateData) {
        try {
            const user = await User.findOneAndUpdate(
                { 
                    authId, 
                    'contacts._id': contactId 
                },
                { 
                    $set: { 'contacts.$': updateData } 
                },
                { new: true }
            );
            return await user.getFullProfile();
        } catch (error) {
            throw new Error(`Error updating contact: ${error.message}`);
        }
    }

    // Get user statistics
    async getUserStats(authId) {
        try {
            const user = await User.findOne({ authId })
                .populate('referredUsers', 'authId')
                .populate('referredBy', 'authId');

            if (!user) {
                throw new Error('User not found');
            }

            return {
                totalReferrals: user.referredUsers.length,
                totalRewards: user.referralRewards,
                totalFeedbacks: user.feedbacks.length,
                totalContacts: user.contacts.length,
                referralDetails: {
                    referredBy: user.referredBy ? await user.referredBy.getFullProfile() : null,
                    referredUsers: await Promise.all(
                        user.referredUsers.map(u => u.getFullProfile())
                    )
                }
            };
        } catch (error) {
            throw new Error(`Error fetching user stats: ${error.message}`);
        }
    }
}

module.exports = new UserService();