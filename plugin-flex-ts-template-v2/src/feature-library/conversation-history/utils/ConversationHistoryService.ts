import * as Flex from '@twilio/flex-ui';

import ApiService from '../../../utils/serverless/ApiService';
import { EncodedParams } from '../../../types/serverless';

export interface AddParticipantToConversationResponse {
    success: boolean;
}

export interface FetchConversationsByParticipantResponse {
    conversations: [],
    success: boolean;
}

export interface FetchConversationMessagesResponse {
    success: boolean;
    messages: [];
}

class ConversationHistoryService extends ApiService {

    async addParticipantToConversation(address: string, conversationSid: string): Promise<AddParticipantToConversationResponse> {
        const manager = Flex.Manager.getInstance();

        const encodedParams: EncodedParams = {
            Token: encodeURIComponent(manager.user.token),
            address: encodeURIComponent(address),
            conversationSid: encodeURIComponent(conversationSid)
        };

        return this.fetchJsonWithReject<AddParticipantToConversationResponse>(
            `${this.serverlessProtocol}://${this.serverlessDomain}/features/conversation-history/flex/addParticipantToConversation`,
            {
                method: 'post',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: this.buildBody(encodedParams),
            },
        ).then((response): AddParticipantToConversationResponse => {
            return {
                success: response.success
            };
        });
    }

    async fetchConversationsByParticipant(phoneNumber: string): Promise<FetchConversationsByParticipantResponse> {
        const manager = Flex.Manager.getInstance();

        const encodedParams: EncodedParams = {
            Token: encodeURIComponent(manager.user.token),
            phoneNumber: encodeURIComponent(phoneNumber)
        };

        return this.fetchJsonWithReject<FetchConversationsByParticipantResponse>(
            `${this.serverlessProtocol}://${this.serverlessDomain}/features/conversation-history/flex/fetchAllConversationsByParticipant`,
            {
                method: 'post',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: this.buildBody(encodedParams),
            },
        ).then((response: any) => {
            return {
                success: response.success,
                conversations: response.data
            };
        });
    }

    async fetchConversationMessages(conversationSid: string): Promise<FetchConversationMessagesResponse> {
        const manager = Flex.Manager.getInstance();

        const encodedParams: EncodedParams = {
            Token: encodeURIComponent(manager.user.token),
            conversationSid: encodeURIComponent(conversationSid)
        };

        return this.fetchJsonWithReject<FetchConversationMessagesResponse>(
            `${this.serverlessProtocol}://${this.serverlessDomain}/features/conversation-history/flex/fetchConversationMessages`,
            {
                method: 'post',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: this.buildBody(encodedParams),
            },
        ).then((response: any) => {
            return {
                success: response.success,
                messages: response.data
            };
        });
    }
}

export default new ConversationHistoryService();