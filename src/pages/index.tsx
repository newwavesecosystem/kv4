import Head from "next/head";
import { useRecoilValue } from "recoil";
import PostLeave from "~/components/PostLeave";
import PostSignIn from "~/components/PostSignIn";
import PreSignIn from "~/components/PreSignIn";
import { authUserState, postLeaveMeetingState } from "~/recoil/atom";

export default function Home() {
  const user = useRecoilValue(authUserState);
  const postLeaveMeeting = useRecoilValue(postLeaveMeetingState);
  return (
    <>
      {postLeaveMeeting ? (
        <PostLeave />
      ) : (
        <>{user ? <PostSignIn /> : <PreSignIn />}</>
      )}
    </>
  );
}
