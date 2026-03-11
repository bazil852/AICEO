Authentication

# Authentication

Start making requests to the Recall API.

## API Keys

API keys are used to authenticate to the Recall.ai platform. API keys don't expire and must be explicitly disabled if you want to rotate an API key.

You can create and manage your API keys in the Recall dashboard:

* [(US) us-east-1](https://us-east-1.recall.ai/dashboard/api-keys)
* [(US) us-west-2](https://us-west-2.recall.ai/dashboard/api-keys)
* [(EU) eu-central-1](https://eu-central-1.recall.ai/dashboard/api-keys)
* [(JP) ap-northeast-1](https://ap-northeast-1.recall.ai/dashboard/api-keys)

<Callout icon="📘" theme="info">
  API keys belong to individual users, but access is [Workspace](https://docs.recall.ai/docs/environments)-scoped. This means that multiple accounts under the same environment share access to the same resources, but have their own API keys.

  We **highly recommend** adding a service account such as [engineering@your-company.com](engineering@company.com) when creating API keys for production Workspaces. Should a team member leave in the future, this will ensure that no production workflows are interrupted when you revoke their access.
</Callout>

<br />

## HTTP Header: Token Authorization

All requests must be authenticated by providing your Recall API key in the HTTP `Authorization` header:

```
Authorization: $RECALLAI_API_KEY
```

Unauthenticated requests will receive a 401 error: `401: Unauthorized`.

<Callout icon="📘" theme="info">
  The `Token` prefix is optional, and can be safely omitted.
</Callout>

<br />



API Errors

# API Errors

## API Error Codes

Recall's API uses the following HTTP codes:

| Error Code | Meaning                                                                                                                                                                                                                 |
| :--------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 200        | OK -- Everything worked as expected.                                                                                                                                                                                    |
| 201        | Bot created successfully.                                                                                                                                                                                               |
| 400        | There was something wrong with your request. Check the response body for a detailed error message. For the error message reference, go [here](https://recallai.readme.io/reference/errors#400-error-message-reference). |
| 401        | Unauthorized -- No valid API key provided.                                                                                                                                                                              |
| 402        | (Self-serve customers) Insufficient credit balance -- Top up balance in the [dashboard](https://us-west-2.recall.ai/dashboard/billing/payment/setup).                                                                   |
| 403        | Request Blocked -- Our WAF blocked your request due to an [issue](#403-request-blocked) with your payload.                                                                                                              |
| 405        | Method is not allowed for the endpoint -- if calling DELETE, the bot has already been dispatched.                                                                                                                       |
| 409        | Conflict -- please retry with exponential backoff (see [Scheduling Guide](https://docs.recall.ai/docs/scheduling-guide#handling-409s) and [Idempotency](https://docs.recall.ai/reference/idempotency))                                                                       |
| 429        | Too many requests: Retry after the duration specified in the returned [`Retry-After`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Retry-After) header (`Retry-After: <delay-seconds>`).                   |
| 502        | Our servers have dropped the request due to high load -- please retry.                                                                                                                                                  |
| 503        | Our servers have dropped the request due to high load -- please retry.                                                                                                                                                  |
| 504        | Our servers have dropped the request due to high load -- please retry.                                                                                                                                                  |
| 507        | Out of adhoc bots -- Please retry in 30 seconds.                                                                                                                                                                        |

<br />

## 400 Error Message Reference

| Code                           | Response Body                                                                              | Description                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| :----------------------------- | :----------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `teams_blacklisted_tenant`     |                                                                                            | Microsoft Teams has certain tenants that do not allow bots to join their calls. This error occurs when you attempt to create a bot for a meeting hosted by one of these tenants. There is no workaround for this error.                                                                                                                                                                                                                      |
| `update_bot_failed`            | Only non-dispatched bots can be updated                                                    | This typically happens when [Update Scheduled Bot](https://docs.recall.ai/reference/bot_partial_update) is called on a bot that was already sent to a call. You can verify a scheduled bot was already sent to a call when you receive the `joining_call` [webhook event](https://docs.recall.ai/reference/bot-status-change-events).                                                                                                                                                                  |
| `update_bot_failed`            | Not enough time to launch new bot                                                          | This typically happens when [Update Scheduled Bot](https://docs.recall.ai/reference/bot_partial_update) is called with an updated `join_at` too close to the present (`<10` minutes). There is a minimum amount of time it takes for us to launch a scheduled bot, and we cannot update a scheduled bot's `join_at` too close to the present for that reason. To handle this, you should delete the scheduled bot and create a new adhoc bot to join the meeting instead. |
| `cannot_command_completed_bot` | Cannot send a command to a bot which has completed(is shutting/has shut down/has errored). | This error occurs when a bot is shutting down, has shut down, or has errored, and you call an endpoint that requires the bot to be in the call - for instance, [Remove Bot From Call](https://docs.recall.ai/reference/bot_leave_call_create).                                                                                                                                                                                                                            |
| `cannot_command_unstarted_bot` | Cannot send a command to a bot which has not been started.                                 | This occurs when you call an endpoint that requires the bot to be in a call while the bot has already been terminated - for instance, [Remove Bot From Call](https://docs.recall.ai/reference/bot_leave_call_create).                                                                                                                                                                                                                                                     |

<br />

## Fatal Errors

When you get a [Bot Status Change Webhook Event](https://docs.recall.ai/docs/bot-status-change-events) from a bot with status `fatal`, you can check the `data.status.sub_code` field to get a description of the error. The complete list for possible `sub_code` can be found here [Bot Error Codes](https://docs.recall.ai/docs/sub-codes#fatal-sub-codes)

<br />

## 403 Request Blocked

Our WAF may block your request and return a 403 status code if your payload is flagged as potentially malicious or malformed.

In this case, response body will have a `request_blocked` code:

```json
{
    "code": "request_blocked",
    "detail": "Request was blocked due to security rules. This is likely due to providing a localhost URL in your payload. More details: https://docs.recall.ai/reference/errors#/403-request-blocked"
}
```

Common scenarios include:

* Providing a `localhost` URL in your payload
* Providing a body (including a null body) in a GET request

<Callout icon="📘" theme="info">
  Tip: If you're trying to test locally, instead of providing a localhost URL, you should use an ngrok tunnel to expose your local server through a public endpoint.

  See [Testing Webhooks Locally](https://docs.recall.ai/docs/testing-webhooks-locally) for a full setup guide.
</Callout>

<br />

## 429 Rate Limit Exceeded

When you exceed your rate limit for a given endpoint, you will receive a response with a 429 status code.

The response will have a `Retry-After` header in the following form: `Retry-After: <delay-seconds>`

You should use this value in your retry strategy to ensure your integration can robustly handle throttling.

If you are already handling 429 errors accordingly, and are hitting persistent warnings about nearing a limit, please reach out to the team at [support@recall.ai](mailto:support@recall.ai) or your shared slack channel to request a limit increase.

<Callout icon="📘" theme="info">
  Rate limits are enforced using a sliding-window strategy.
</Callout>

## 507 Insufficient Storage

The 507 error only occurs for ad-hoc bots and indicates there are no more ad-hoc bots available in our "pool" of ad-hoc bots. Read more about scheduled bots, ad-hoc bots, and the ad-hoc bot pool below.

### Scheduled bots

> ✅ Scheduled bots always join on-time and will never encounter 507 errors

A scheduled bot is a bot created via the [Create Bot](https://docs.recall.ai/reference/bot_create) or [Schedule Bot For Calendar Event](https://docs.recall.ai/reference/calendar_events_bot_destroy) endpoints with a `join_at` set more than 10 minutes from the time you make the request.

You should try using scheduled bots wherever possible because:

* Scheduled bots guarantee your bots join the meeting on time every time
* Scheduled bots will never run into a 507 error (no more ad-hoc bots in the ad-hoc bot pool claim)
* Scheduled bots come at no extra charge and reserves a dedicated instance, separate from the ad-hoc bot pool (described below)

<Callout icon="⚙️" theme="default">
  You can use <Anchor label="this sample app" target="_blank" href="https://github.com/recallai/sample-apps/tree/main/bot_delete_scheduled_bots">this sample app</Anchor> to see how to delete bot's recording media within a given time range and/or for a specific customer (using custom metadata)
</Callout>

### Ad-hoc bots

> 📘 When to use ad-hoc bots
>
> Ad-hoc bots are meant to fill in the gaps where you can't schedule bots more than 10 minutes in advance (e.g. ad-hoc/last minute meetings).
>
> You should use ad-hoc bots sparingly, opting for scheduled bots whenever possible

An ad-hoc bot is a bot created via the [Create Bot](https://docs.recall.ai/reference/bot_create) or [Schedule Bot For Calendar Event](https://docs.recall.ai/reference/calendar_events_bot_destroy) endpoints with a `join_at` set less than 10 minutes from the time you make the request.

#### Finding your concurrent ad-hoc bot limit

You can find a given workspace's concurrent ad-hoc bot limit in the dashboard under Developers > Rate Limits

![](https://files.readme.io/f056d11fc09b0c0f43f9ca5a2531769dd749debd6cd435ba1a3366936bc4ee08-CleanShot_2025-12-14_at_18.55.512x.png)

### Ad-hoc bot pool

Starting up a bot takes some time (10 minutes) before it is ready to join a meeting since each bot runs on its own dedicated machine. Because of this, we maintain a pool of "warm" bot instances that are already running in cases where you need to claim a bot last minute (or ad-hoc)

Each region has its own dedicated ad-hoc bot pool and this ad-hoc bot pool is shared among all developers in a region. The ad-hoc bot pool is calibrated and adaptive, constantly being replenished and grows with active usage. It is designed to maintain sufficient warm bot instances to support peak usage at any given time.

That said, the bot pool can still be drained during short periods with very high ad-hoc bot activity in a specific region. In these cases, there are no warm bot instances available and you will need to wait until more bot instances have warmed up before you can claim an ad-hoc bot

> ❗️ 507 error: the limitation of ad-hoc bots
>
> If you rely on ad-hoc bots, you will eventually encounter 507 errors indicating there are no more ad-hoc bots left to claim.
>
> When you encounter a 507 error, you can:
>
> * When a `Retry-After` header is passed, retry your request in `Retry-After` seconds.
> * Retry the request every 30s until you're able to claim an ad-hoc (usually within a few retries).
> * Audit your workflows to see if you can use scheduled bots which never encounter 507 errors

### What to do when you encounter a 507

If you must use ad-hoc bots and still encounter a 507 error, you can retry the request every 30s. You should be able to claim an ad-hoc bot within a few retries. If you receive a `Retry-After` header, you can try your request again in `Retry-After` seconds.

<br />

## FAQs

### Is there a health-check endpoint?

There isn't a health-check endpoint available.


Webhooks

# Webhooks

Overview of Recall webhooks.

Recall uses webhooks to push data or notify your server when certain events happen. There are a few different types of webhooks to be aware of. You may find yourself using some, none, or all of these depending on your application and use case.

> 📘 View the webhooks dashboard
>
> * <Anchor label="(US) us-east-1" target="_blank" href="https://us-east-1.recall.ai/dashboard/webhooks/">(US) us-east-1</Anchor>
> * <Anchor label="(Pay-as-you-go) us-west-2" target="_blank" href="https://us-west-2.recall.ai/dashboard/webhooks/">(Pay-as-you-go) us-west-2</Anchor>
> * <Anchor label="(EU) eu-central-1" target="_blank" href="https://eu-central-1.recall.ai/dashboard/webhooks/">(EU) eu-central-1</Anchor>
> * <Anchor label="(JP) ap-northeast-1" target="_blank" href="https://ap-northeast-1.recall.ai/dashboard/webhooks/">(JP) ap-northeast-1</Anchor>

<br />

## Webhook Types

<Table align={["left","left","left"]}>
  <thead>
    <tr>
      <th>
        Webhook Type
      </th>

      <th>
        Where to setup
      </th>

      <th>
        Links
      </th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>
        Bot status change
      </td>

      <td>
        Webhooks Dashboard (Svix webhook)
      </td>

      <td>
        [Bot Status Change Events](https://docs.recall.ai/docs/bot-status-change-events)
      </td>
    </tr>

    <tr>
      <td>
        Recording status change
      </td>

      <td>
        Webhooks Dashboard (Svix webhook)
      </td>

      <td>
        [Recording Webhooks](https://docs.recall.ai/docs/recording-webhooks)
      </td>
    </tr>

    <tr>
      <td>
        Calendar V2
      </td>

      <td>
        Webhooks Dashboard (Svix webhook)
      </td>

      <td>
        [Calendar V2 Webhooks](https://docs.recall.ai/docs/calendar-v2-webhooks)
      </td>
    </tr>

    <tr>
      <td>
        Transcription
      </td>

      <td>
        Real-time Endpoint
      </td>

      <td>
        [Real-time Transcription](https://docs.recall.ai/docs/dsdk-realtime-transcription)\
        [Async Transcription](https://docs.recall.ai/docs/asynchronous-transcription)
      </td>
    </tr>

    <tr>
      <td>
        Participant Events
      </td>

      <td>
        Real-time Endpoint
      </td>

      <td>
        [Real-Time Webhook Endpoints](https://docs.recall.ai/docs/real-time-webhook-endpoints)
      </td>
    </tr>
  </tbody>
</Table>

<br />

## Configuring webhooks

Depending on the system (svix vs real-time endpoint), there are two ways to configure webhooks

### Svix webhook setup

Make sure that you've subscribed to all events that you want to receive. If you are not subscribed to a specific event, it will not be sent to your webhook endpoint.

#### How to subscribe to Svix webhook events

<Image border={false} src="https://files.readme.io/07b7291afc404ea99841033631d192ce55f2679772f7950826cbfd55b99b430a-CleanShot_2026-01-09_at_11.11.292x.png" />

### Real-time endpoints webhook setup

Read more about how to [configure your real-time endpoint webhook](https://docs.recall.ai/docs/real-time-webhook-endpoints)

<br />

## Verifying webhooks

See [here](https://docs.recall.ai/docs/verify-events#/validation) for how to verify webhooks.

<br />

## Retry Schedules

<Callout icon="📘" theme="info">
  You can stop retries by returning a successful response for the webhook request (e.g. 2xx)
</Callout>

The retry schedules differ between webhook providers:

### Svix Webhook Retry Policy

> Each message is attempted based on the following schedule, where each period is started following the failure of the preceding attempt:
>
> * Immediately
> * 5 seconds
> * 5 minutes
> * 30 minutes
> * 2 hours
> * 5 hours
> * 10 hours
> * 10 hours (in addition to the previous)
>
> If an endpoint is removed or disabled delivery attempts to the endpoint will be disabled as well.
>
> For example, an attempt that fails three times before eventually succeeding will be delivered roughly 35 minutes and 5 seconds following the first attempt.

Read more about svix's retry policy [here](https://docs.svix.com/retries#the-schedule).

### Real-time Endpoint Webhooks Retry Policy

Read more about the real-time endpoint webhooks retry policy <Anchor label="here" target="_blank" href="doc:real-time-webhook-endpoints#retry-policy">here</Anchor>.

<br />

## FAQs

### Can I increase the timeout for webhook requests?

No, you cannot increase the timeout for webhook requests.

There may be cases where you can't process the webhook before the request times out, in which case the request would have been considered as failed and the request is retried (even if the work has completed after the request has timed out). To avoid this, you should process the work async and immediately return a successful response to prevent the webhook from retrying.

### Why did the svix webhook endpoint automatically disabled?

If all webhooks sent to a particular endpoint in svix fails for 5 days, the endpoint will be automatically disabled.

Endpoints can be re-enabled in the webhooks dashboard (see callout at top of doc to find your region's webhooks dashboard link). More details can be found in the <Anchor label="Svix documentation" target="_blank" href="https://docs.svix.com/retries#disabling-failing-endpoints">Svix documentation</Anchor>.

<Image border={false} src="https://files.readme.io/4ce6ad7e6b74cce3316c87b71d38d39d9aac6e213770a85c52b7d01df379c96e-CleanShot_2026-01-18_at_20.28.472x.png" />

You can also set alerts to notify you via email when a webhook endpoint has been automatically disabled (see callout at top of doc to find your region's webhooks dashboard link).

<Image border={false} src="https://files.readme.io/d41cda210d1085a372703980b7d869f0e8fcf7212d426ef5d3301ab37241a1b4-CleanShot_2026-01-18_at_20.25.302x.png" />

### What IP addresses are webhooks sent from?

You may want to whitelist IP addresses for webhook delivery depending on your security requirements.

* <Anchor label="Svix webhooks are sent from static IPs" target="_blank" href="https://docs.svix.com/receiving/source-ips">Svix webhooks are sent from static IPs</Anchor>
* Real-time endpoint webhooks are not sent from static IPs so you are not able to whitelist real-time endpoint webhooks

### Are custom query parameters/variables passed through the webhook URLs?

Yes! You can pass through custom webhook parameters for both svix and real-time endpoint webhook URLs. For example, you can set a custom query param for each workspace like the following:

* `?env=dev`
* `?env=staging`
* `?env=production`

You will then receive this query param in the request URL when receiving webhook events.

### Will the webhook response ever change?

No, you should not expect the webhook response to change under any conditions. Recall will not push breaking changes and are committed to supporting every version of the API forever. If you have any concerns about this or are seeing issues otherwise, reach out to `support@recall.ai`

### How do I replay failed webhooks that has exceeded the retry schedule?

Sometimes your webhook endpoint may not be responding to webhooks properly, due to an accidental code, cloud provider downtime, etc.In this case, it can be helpful to replay failed webhook attempts.

#### Replaying failed Svix webhooks

You can do this by going to the Webhooks page in the Recall.ai dashboard, selecting your webhook endpoint, and clicking **Recover failed messages:**

<Image border={false} src="https://files.readme.io/04c996014ff92d7222ed659f7800a428bf83e7a751c0a6bf2c137bbcc32f39c9-CleanShot_2025-10-23_at_12.46.45.png" />

From there, you can select the time window for which you want to replay failed messages for:

<Image border={false} src="https://files.readme.io/609fbef54b9c77798807808e81e5bf42039585b5a11bffb15264d9874c58cc84-CleanShot_2025-10-23_at_12.51.13.png" />

#### Replaying failed real-time endpoint webhooks

It is not possible to replay a real-time endpoint webhook once the retry policy has completed. That said, you can still query the data async after the meeting has ended as long as the recording media has not expired.



