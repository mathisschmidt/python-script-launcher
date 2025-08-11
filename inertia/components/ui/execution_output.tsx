import {useEffect, useState} from "react";
import {Subscription} from "@adonisjs/transmit-client";
import {useTransmit} from "~/components/common/transmit";

type PropsExecutionOutput = {
  channelName: string
}

export default function ExecutionOutput(props: PropsExecutionOutput) {
  // const {channelName} = props
  const channelName = "test"
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const transmit = useTransmit()

  const handleSubscription = async (channelName: string) => {
    if (subscription) {
      await subscription.delete();
    }

    const newSubscription = transmit.subscription(channelName)

    console.log("Subscribing to channel:", channelName)
    newSubscription.onMessage((data) => {
      console.log(data)
    })
    await newSubscription.create()

    setSubscription(newSubscription)
  }

  useEffect(() => {
    handleSubscription(channelName)

    return () => {
      if (subscription) {
        subscription.delete();
      }
    }
  }, []);

  return (<></>)
}
