import LegalDocumentPage from "../components/legal/LegalDocumentPage";
import { termsOfService } from "../content/legal";

export default function TermsOfService() {
  return <LegalDocumentPage document={termsOfService} />;
}
