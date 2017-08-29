require 'rails_helper'

feature "Timeout Warning", js: true do

  def timeout_warning_text
    I18n.t("session_timeout_prompter.your_session_will_expire_in")
  end

  context "when the timeout is set at 5 seconds" do
    context "and the timeout warning is set to 3 seconds" do
      # Setup: spec/dummy/app/views/layout/application.html.erb

      before { visit root_path }

      context "and 1 second has passed" do
        before { sleep 1 }

        scenario "I do not see the prompt" do
          expect(page).not_to have_content timeout_warning_text
        end
      end

      context "and 2 seconds have passed" do
        scenario "I see the prompt" do
          Timeout.timeout(2.5, TimeoutWarningNotFound) do
            begin
              loop until first(:css, '*', text: timeout_warning_text, visible: true)
            rescue TimeoutWarningNotFound
              fail "timeout prompt not found"
            end
          end
          expect(true).to be_truthy
        end
      end

    end
  end

end

class TimeoutWarningNotFound < StandardError; end