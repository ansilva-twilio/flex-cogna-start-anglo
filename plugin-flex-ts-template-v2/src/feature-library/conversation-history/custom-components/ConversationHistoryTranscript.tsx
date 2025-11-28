import React from 'react';
import * as Flex from '@twilio/flex-ui';
import { ITask, Icon, withTaskContext } from '@twilio/flex-ui';
import {
    ChatLog,
    ChatMessage,
    ChatMessageMeta,
    ChatMessageMetaItem,
    ChatBubble,
    ChatAttachment,
    ChatAttachmentLink,
    ChatAttachmentDescription
} from '@twilio-paste/chat-log';

import ConversationHistoryService from '../utils/ConversationHistoryService';

type MyProps = {
    task: ITask;
    conversationSid: string;
    manager: Flex.Manager;
};

type MessageTrimmed = {
    index: string,
    author: string,
    body: string,
    media: any,
    dateCreated: string
}

type Media = {
    filename: string,
    content_type: string,
    size?: number;
    sid?: string;
}

type MyState = {
    messages: MessageTrimmed[];
};

class ConversationHistoryTranscript extends React.Component<MyProps, MyState> {

    constructor(props: any) {
        super(props);
        this.state = {
            messages: []
        }
    }

    async componentDidMount() {
        const fetchMessagesRequest = await ConversationHistoryService.fetchConversationMessages(this.props.conversationSid);
        this.setState({ messages: fetchMessagesRequest?.messages ?? [] });
    }

    // Helper function to get media URL via serverless function
    // We use a serverless function because direct API calls require server-side authentication
    getMediaUrl(media: Media): string {
        if (!media.sid) {
            console.warn('[ConversationHistory] Media object missing sid', media);
            return '#';
        }

        const manager = Flex.Manager.getInstance();
        let serverlessDomain = manager.serviceConfiguration.runtime_domain;
        const token = manager.user.token; // Get Flex token for authentication

        // Detect if running locally
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.includes('172.27');

        if (isLocalhost) {
            // Use local serverless development server
            serverlessDomain = 'localhost:3001';
            console.log('[ConversationHistory] Using local serverless domain:', serverlessDomain);
        } else {
            // Fallback to the correct serverless domain if runtime_domain is outdated
            // TODO: Update Flex configuration to point to the correct domain
            if (!serverlessDomain || serverlessDomain === 'concrete-longhorn-6910.twil.io') {
                serverlessDomain = 'custom-flex-extensions-serverless-8888-dev.twil.io';
                console.warn('[ConversationHistory] Using fallback serverless domain:', serverlessDomain);
            } else {
                console.log('[ConversationHistory] Serverless domain from config:', serverlessDomain);
            }
        }

        // Use serverless function to get authenticated media URL
        // The serverless function has proper credentials and returns a temporary URL
        // We pass the Flex token for authentication
        const conversationSid = this.props.conversationSid;
        const protocol = isLocalhost ? 'http' : 'https';
        const url = `${protocol}://${serverlessDomain}/features/conversation-history/flex/fetchMediaContent?conversationSid=${conversationSid}&mediaSid=${media.sid}&Token=${token}`;

        console.log('[ConversationHistory] Generated media URL (token hidden)');
        return url;
    }

    render() {
        return (
            <ChatLog>
                {
                    (this.state.messages ?? [])?.map((message) => {
                        let dateTime: string = message.dateCreated;
                        const uuidPattern = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
                        if (message.author.startsWith("whatsapp:") || message.author.startsWith("+") || uuidPattern.test(message.author) || message.author === 'Virtual Assistant') {
                            return (
                                <ChatMessage variant="inbound" key={message.index}>
                                    <ChatBubble >{message.body}</ChatBubble>
                                    {
                                        (message.media ?
                                            (Array.isArray(JSON.parse(message.media)) ?
                                                JSON.parse(message.media)
                                                : [JSON.parse(message.media)])
                                            : []
                                        )?.map((media: any, index: any) => {
                                            if (!media) {
                                                return;
                                            }
                                            try {
                                                let filename = media.filename;
                                                let content_type = media.content_type;
                                                if (!filename) {
                                                    filename = 'undefined';
                                                }
                                                if (!content_type) {
                                                    content_type = 'undefined';
                                                }
                                                const mediaUrl = this.getMediaUrl(media);
                                                return (
                                                    <ChatBubble key={index}>
                                                        <ChatAttachment attachmentIcon={<Icon icon="Whatsapp" />} >
                                                            <ChatAttachmentLink href={mediaUrl} download={filename}>{filename}</ChatAttachmentLink>
                                                            <ChatAttachmentDescription>{content_type}</ChatAttachmentDescription>
                                                        </ChatAttachment>
                                                    </ChatBubble>
                                                )
                                            } catch (e) {
                                                console.log('ERROR', e);
                                                const errorKey = `error-media-${index}`;
                                                return (
                                                    <ChatBubble key={errorKey}>
                                                        (Não foi possível carregar o arquivo de mídia)
                                                    </ChatBubble>
                                                )
                                            }
                                        })
                                    }
                                    <ChatMessageMeta aria-label="customer" >
                                        <ChatMessageMetaItem>{message.author} ・ {dateTime.slice(0, 24)}</ChatMessageMetaItem>
                                    </ChatMessageMeta>
                                </ChatMessage>
                            )
                        }
                        else {
                            let author = message.author || '-';
                            if (author === this.props.conversationSid) {
                                author = "Agente Virtual";
                            }

                            return (
                                <ChatMessage variant="outbound" key={message.index}>
                                    <ChatBubble >{message.body}</ChatBubble>
                                    {
                                        (message.media ?
                                            (Array.isArray(JSON.parse(message.media)) ?
                                                JSON.parse(message.media)
                                                : [JSON.parse(message.media)])
                                            : []
                                        )?.map((media: Media, index: React.Key) => {
                                            if (!media) {
                                                return;
                                            }
                                            try {
                                                let filename = media.filename;
                                                let content_type = media.content_type;
                                                if (!filename) {
                                                    filename = 'undefined';
                                                }
                                                if (!content_type) {
                                                    content_type = 'undefined';
                                                }
                                                const mediaUrl = this.getMediaUrl(media);
                                                return (
                                                    <ChatBubble key={index}>
                                                        <ChatAttachment attachmentIcon={<Icon icon="Whatsapp" />}>
                                                            <ChatAttachmentLink href={mediaUrl} download={filename}>{filename}</ChatAttachmentLink>
                                                            <ChatAttachmentDescription>{content_type}</ChatAttachmentDescription>
                                                        </ChatAttachment>
                                                    </ChatBubble>
                                                )
                                            } catch (e) {
                                                console.log('ERROR', e);
                                                const errorKey = `error-media-${index}`;
                                                return (
                                                    <ChatBubble key={errorKey}>
                                                        (Não foi possível carregar o arquivo de mídia)
                                                    </ChatBubble>
                                                )
                                            }
                                        })
                                    }
                                    <ChatMessageMeta aria-label="agent" >
                                        <ChatMessageMetaItem>{author} ・ {dateTime.slice(0, 24)}</ChatMessageMetaItem>
                                    </ChatMessageMeta>
                                </ChatMessage>
                            )
                        }
                    })
                }
            </ChatLog>
        );
    }
}

export default withTaskContext(ConversationHistoryTranscript);