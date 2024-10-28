import { Resend } from 'resend';
import { RESEND_API_KEY } from '$env/static/private';
import type { RequestHandler } from '@sveltejs/kit';

const resend = new Resend(RESEND_API_KEY);

type Email = {
  from: string;
  to: string;
  subject: string;
  html: string;
}

type Subscriber = {
  email: string;
  firstName: string;
  lastName: string;
  unsubscribed: boolean;
}

const sendBatchEmail = async (emails: Email[]) => {
  const { data, error} = await resend.batch.send(emails);
  
  if (error) {
    return { data: null,error };
  }
  return { data };
}

const getAudiences = async () => {
  const { data, error } = await resend.audiences.list();

  if (error) {
    return { data: null, error };
  }
  return { data, error: null };
}

const getContactsInAudience = async (audienceId: string) => {
  const { data, error } = await resend.contacts.list({ audienceId });

  if (error) {
    return { data: null, error };
  }
  return { data, error: null };
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { data: audiences, error: audiencesError } = await getAudiences();

    if (audiencesError || !audiences) {
      return new Response(
        JSON.stringify({ error: audiencesError?.message || "Audiences not found" }),
        { status: 500 }
      );
    }
    const audienceId = audiences.data[0].id;
    const { data: contacts, error: contactsError } = await getContactsInAudience(audienceId);
    
    if (contactsError || !contacts) {
      return new Response(
        JSON.stringify({ error: contactsError?.message || "Contacts not found" }),
        { status: 500 }
      );
    }

    const subscribers: Subscriber[] = contacts.data.map((contact) => {
      return {
        email: contact.email,
        firstName: contact.first_name || '',
        lastName: contact.last_name || '',
        unsubscribed: contact.unsubscribed
      }
    });
    
    const emails: Email[] = [];

    const { data, error: sendError } = await sendBatchEmail(emails);

    if (sendError) {
      return new Response(
        JSON.stringify({ error: sendError.message }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data,
        sentTo: subscribers.length 
      }),
      { status: 200 }
    );

  } catch (err) {
    console.error('Newsletter sending error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    );
  }
}