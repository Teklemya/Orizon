import LegalDocumentPage from "../components/legal/LegalDocumentPage";
import { privacyPolicy } from "../content/legal";

export default function PrivacyPolicy() {
  return <LegalDocumentPage document={privacyPolicy} />;
}
