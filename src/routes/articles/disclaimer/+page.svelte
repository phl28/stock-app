<div class="disclaimer-container">
	<div class="disclaimer-header">
		<h1>Disclaimer</h1>
		<p>Last Updated: October 27, 2024</p>
	</div>

	<div class="warning-box">
		<strong>IMPORTANT:</strong> The content on this website is for informational purposes only. Nothing
		contained within should be construed as financial advice or investment recommendations.
	</div>

	<div class="disclaimer-section">
		<h2>Not Financial Advice</h2>
		<ul class="list-disc">
			<li>
				All content, including analysis, commentary, and market insights, reflects personal views
				and observations
			</li>
			<li>No content establishes a financial advisor-client relationship</li>
			<li>Past performance discussed in any post does not guarantee future results</li>
			<li>Trading and investing in financial markets carries substantial risk of loss</li>
		</ul>
	</div>

	<div class="disclaimer-section">
		<h2>Your Responsibility</h2>
		<p>By using this website, you acknowledge and agree that:</p>
		<ol class="list-decimal">
			<li>You are solely responsible for your investment decisions and trading actions</li>
			<li>
				You will conduct your own due diligence and seek professional financial advice before making
				any investment decisions
			</li>
			<li>You understand that stock market investments involve significant risks</li>
			<li>
				Neither the website owner nor any content contributors shall be held liable for any losses,
				damages, or consequences resulting from the use of information provided on this site
			</li>
		</ol>
	</div>

	<div class="disclaimer-section">
		<h2>Accuracy and Updates</h2>
		<p>While we strive to ensure accuracy, we:</p>
		<ul class="list-disc">
			<li>
				Make no warranties about the completeness, reliability, or accuracy of the information
				provided
			</li>
			<li>Are not obligated to update or correct any outdated or incorrect information</li>
			<li>Are not responsible for any errors or omissions in the content</li>
		</ul>
	</div>

	<div class="footer">
		<p>
			By accessing and using this website, you explicitly agree to this disclaimer and release the
			website owner from any and all liability associated with your use of the information provided.
		</p>
	</div>
</div>

<style lang="postcss">
	.disclaimer-container {
		@apply mx-auto max-w-4xl p-4 md:p-8;
	}

	.disclaimer-header {
		@apply mb-8 rounded-lg bg-primary p-6 text-white shadow-md md:p-8;
	}

	.disclaimer-header h1 {
		@apply m-0 text-3xl font-bold;
	}

	.disclaimer-section {
		@apply mb-8 rounded-lg border-l-4 border-accent bg-base-200 p-6 md:p-8;
	}

	.warning-box {
		@apply my-8 rounded-lg border-l-4 border-error bg-error/10 p-6;
	}

	h2 {
		@apply mb-4 mt-0 text-2xl font-semibold;
	}

	ul,
	ol {
		@apply pl-6;
	}

	li {
		@apply mb-2;
	}

	.footer {
		@apply mt-12 border-t border-base-300 pt-8 text-center text-base-content/80;
	}

	@media (max-width: 768px) {
		.disclaimer-header,
		.disclaimer-section {
			@apply p-6;
		}
	}
</style>
