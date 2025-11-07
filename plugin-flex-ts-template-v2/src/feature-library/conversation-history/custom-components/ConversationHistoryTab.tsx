import React from 'react';
import * as Flex from '@twilio/flex-ui';
import { ITask, Icon, withTaskContext } from '@twilio/flex-ui';

import { Box } from '@twilio-paste/core/box';
import { Text } from '@twilio-paste/core';
import { Disclosure, DisclosureHeading, DisclosureContent } from '@twilio-paste/core/disclosure';

import ConversationHistoryTranscript from './ConversationHistoryTranscript';
import ConversationHistoryService from '../utils/ConversationHistoryService';

type MyProps = {
    label: string;
    task?: ITask;
    manager: Flex.Manager;
  };

type ConversationTrimmed = {
    conversationSid: string,
    conversationDateCreated: string,
    conversationOriginalChannel: string,
    conversationState : string
}

type MyState = {
    conversations: ConversationTrimmed[];
    phoneNumber: string;
};

class ConversationHistoryTab extends React.Component<MyProps, MyState> {

    constructor(props : any) {
        super(props);
        this.state = {
            conversations: [],
            phoneNumber: ''
        }
    }  

    async componentDidUpdate(){
        if (this.state.phoneNumber != this.props.task?.attributes.from){
            const fetchConversationsRequest = 
                await ConversationHistoryService.fetchConversationsByParticipant(
                    this.props.task?.attributes.from
                );

            this.setState({conversations : fetchConversationsRequest.conversations});
            this.setState({phoneNumber : this.props.task?.attributes.from});
        }
    }
    
    render() {
        
        return (
            <Box padding="space20" width="100vw">
                    {
                        this.state.conversations?.map((conversation, index)=> {
                            let dateTime : string = conversation.conversationDateCreated;
                            if (conversation.conversationSid == this.props.task?.attributes.conversationSid){
                                return;
                            }
                            //define the icon based on the channel
                            let channelIcon;
                            switch(conversation.conversationOriginalChannel) {
                                case 'whatsapp':
                                channelIcon = <Icon icon="Whatsapp"/>;
                                  break;
                                case 'sms':
                                    channelIcon = <Icon icon="Sms"/>;
                                  break;
                                default:
                                    channelIcon = <Icon icon="Message"/>;
                              }
                            return (    
                                <Disclosure key={conversation.conversationSid}>
                                    <DisclosureHeading as="h2" variant="heading50" key={conversation.conversationSid}> 
                                        {channelIcon}{dateTime.slice(0,24)} <Text color="colorTextWeak" fontSize="fontSize20" marginRight="space30" as="span"> ({conversation.conversationState})</Text>
                                    </DisclosureHeading>
                                    <DisclosureContent key={index}>
                                        <ConversationHistoryTranscript conversationSid={conversation.conversationSid} manager={this.props.manager} />
                                    </DisclosureContent>
                                </Disclosure>
                            ) 
                        })
                    }
            </Box>
        );
}
}

export default withTaskContext(ConversationHistoryTab);