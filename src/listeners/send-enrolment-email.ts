import { UserEnrolled } from "../domain/events/UserEnrolled";

export default function sendEnrolmentEmail(event: UserEnrolled): void {
    console.log('send email to ', event.user.email);
    console.log('enrolled to ', event.course.title);

}