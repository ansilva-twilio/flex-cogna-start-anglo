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
    size: BigInteger;
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
        this.setState({ messages: fetchMessagesRequest.messages });
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
                                        (message.media ?? [])?.map((media: any, index: any) => {
                                            if (!media) {
                                                return;
                                            }
                                            let filename = media.filename;
                                            let content_type = media.content_type;
                                            if (!filename) {
                                                filename = 'undefined';
                                            }
                                            if (!content_type) {
                                                content_type = 'undefined';
                                            }
                                            return (
                                                <ChatBubble key={index}>
                                                    <ChatAttachment attachmentIcon={<Icon icon="Whatsapp" />} >
                                                        <ChatAttachmentLink href='#'>{filename}</ChatAttachmentLink>
                                                        <ChatAttachmentDescription>{content_type}</ChatAttachmentDescription>
                                                    </ChatAttachment>
                                                </ChatBubble>
                                            )
                                        })
                                    }
                                    <ChatMessageMeta aria-label="customer" >
                                        <ChatMessageMetaItem>{message.author} ・ {dateTime.slice(0, 24)}</ChatMessageMetaItem>
                                    </ChatMessageMeta>
                                </ChatMessage>
                            )
                        }
                        else {
                            let author = message.author;
                            if (author === this.props.conversationSid) {
                                author = "Agente Virtual";
                            }

                            return (
                                <ChatMessage variant="outbound" key={message.index}>
                                    <ChatBubble >{message.body}</ChatBubble>
                                    {
                                        (message.media ?? [])?.map((media: Media, index: React.Key) => {
                                            if (!media) {
                                                return;
                                            }
                                            let filename = media.filename;
                                            let content_type = media.content_type;
                                            if (!filename) {
                                                filename = 'undefined';
                                            }
                                            if (!content_type) {
                                                content_type = 'undefined';
                                            }
                                            return (
                                                <ChatBubble key={index}>
                                                    <ChatAttachment attachmentIcon={<Icon icon="Whatsapp" />}>
                                                        <ChatAttachmentLink href='#'>{filename}</ChatAttachmentLink>
                                                        <ChatAttachmentDescription>{content_type}</ChatAttachmentDescription>
                                                    </ChatAttachment>
                                                </ChatBubble>
                                            )
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