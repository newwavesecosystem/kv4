export const SPACE = 32;
export const ENTER = 13;
export const TAB = 9;
export const ESCAPE = 27;
export const ARROW_UP = 38;
export const ARROW_DOWN = 40;
export const ARROW_RIGHT = 39;
export const ARROW_LEFT = 37;
export const PAGE_UP = 33;
export const PAGE_DOWN = 34;
export const A = 65;

export default {
  SPACE,
  ENTER,
  TAB,
  ESCAPE,
  ARROW_UP,
  ARROW_DOWN,
  ARROW_RIGHT,
  ARROW_LEFT,
  PAGE_UP,
  PAGE_DOWN,
  A,
};


// const setModOnlyMessage = (resp) => {
//   if (resp && resp.modOnlyMessage) {
//     const sanitizedModOnlyText = SanitizeHTML(resp.modOnlyMessage, {
//       allowedTags: ['a', 'b', 'br', 'i', 'img', 'li', 'small', 'span', 'strong', 'u', 'ul'],
//       allowedAttributes: {
//         a: ['href', 'name', 'target'],
//         img: ['src', 'width', 'height'],
//       },
//       allowedSchemes: ['https'],
//     });
//     setModeratorOnlyMessage(sanitizedModOnlyText);
//   }
//   return resp;
// };


// if(['missingSession','meetingForciblyEnded','notFound'].includes(response.messageKey)) {
//   JoinHandler.setError('410');
//   Session.set('errorMessageDescription', 'meeting_ended');
// } else if(response.messageKey == "guestDeny") {
//   JoinHandler.setError('401');
//   Session.set('errorMessageDescription', 'guest_deny');
// } else if(response.messageKey == "maxParticipantsReached") {
//   JoinHandler.setError('401');
//   Session.set('errorMessageDescription', 'max_participants_reason');
// } else {
//   JoinHandler.setError('401');
//   Session.set('errorMessageDescription', response.message);
// }

