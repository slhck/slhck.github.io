---
layout: post
title: "When WhatsApp Shows the Wrong Name for a Phone Number on Android"
date: 2026-05-05
categories: misc
---

A weird thing happened to me recently. I was playing around with OpenClaw, and, despite their recommendations, I set up WhatsApp using my own number. When I texted myself for testing purposes, my name showed as “John Doe” (well, not literally, but I won't name that person here), not as me. That was quite confusing. And while I found the original issue, which was Hubspot having stored that John contact with my number by accident, I couldn't get rid of John (sorry, John) from my phone. Google Contacts had everything corrected, and so did the contact card on the phone, but it still kept up showing incorrectly whenever something came in from my own number.

The root cause turned out to be a stale entry in WhatsApp's own copy of the Android contacts database, left over from that address book mistake. If you're seeing a similar mismatch, here's what's going on and how to fix it.

## Why Other Apps Still Show the Wrong Name

As I found out, on Android, every app that syncs contacts can register its own account type and write rows into the system contacts provider. WhatsApp does this – when it scans your address book, it stores its own copy of each contact under the `com.whatsapp` account type. When another app — in my case a SIP client — looks up a phone number, Android merges results from all account types and may pick the wrong display name if more than one matches.

So even after Google Contacts is clean, an old WhatsApp-side row can keep returning the wrong name to anyone who queries the system.

## How to Find the Ghost Row

If you have [ADB](https://developer.android.com/tools/adb) set up, you can query the contacts provider directly. First, list all phone-number rows that match the offending number:

```bash
adb shell content query \
  --uri content://com.android.contacts/data/phones \
  --projection display_name:data1:account_type_and_data_set \
  | grep -i "<your number or name>"
```

You'll likely see several rows for the same number, one per account type (`com.google`, `com.whatsapp`, your SIP app's account type, etc.). If one of them has the wrong display name, that's your ghost, John.

To confirm which raw contact the row belongs to, query `raw_contacts`:

```bash
adb shell "content query \
  --uri content://com.android.contacts/raw_contacts \
  --projection _id:account_type:account_name:display_name:sync1 \
  --where \"display_name='Wrong Name'\""
```

In my case the offending row had `account_type=com.whatsapp` and a `sync1` value like `<digits>@s.whatsapp.net`, which made it obvious that WhatsApp was the source.

## How to Fix

The trick is to make WhatsApp rebuild its contact mirror from your address book (i.e., Google Contacts). What worked for me, in this order:

1. Go to your settings, then *Apps → WhatsApp* and force-quit it
2. Go to *Storage* and tap "Clear cache". Do not tap "Clear data", which would wipe your chats!
3. Go to *Permissions → Contacts*. Turn the permission off, wait a moment, and turn it back on.
4. Then open WhatsApp so it rebuilds its sync.

Re-run the `content query` from above. We will have eliminated John, and the entry that previously showed the wrong name should now show the correct one (or your own name, if the number is yours).

The general lesson: when an Android app shows a contact name that you can't find anywhere in your address book, suspect another app's contact-provider mirror before assuming the data is wrong upstream.
