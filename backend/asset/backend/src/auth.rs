use actix_web::body::MessageBody;
use actix_web::dev::{ServiceRequest, ServiceResponse, Transform};
use actix_web::Error;
use futures::future::{ok, LocalBoxFuture, Ready};
use log::warn;
use std::sync::Arc;
use std::task::{Context, Poll};

pub struct ApiKeyMiddleware {
    api_key: Arc<String>,
}

impl ApiKeyMiddleware {
    pub fn new(api_key: String) -> Self {
        ApiKeyMiddleware {
            api_key: Arc::new(api_key),
        }
    }
}

impl<S, B> Transform<S, ServiceRequest> for ApiKeyMiddleware
where
    S: actix_web::dev::Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,
    S::Future: 'static,
    B: MessageBody + 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Transform = ApiKeyMiddlewareService<S>;
    type InitError = ();
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ok(ApiKeyMiddlewareService {
            service: Arc::new(service),
            api_key: self.api_key.clone(),
        })
    }
}

pub struct ApiKeyMiddlewareService<S> {
    service: Arc<S>,
    api_key: Arc<String>,
}

impl<S, B> actix_web::dev::Service<ServiceRequest> for ApiKeyMiddlewareService<S>
where
    S: actix_web::dev::Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,
    S::Future: 'static,
    B: MessageBody + 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Future = LocalBoxFuture<'static, Result<Self::Response, Self::Error>>;

    fn poll_ready(&self, cx: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
        self.service.poll_ready(cx)
    }

    fn call(&self, req: ServiceRequest) -> Self::Future {
        let path = req.path().to_string();

        if path == "/health" {
            let fut = self.service.call(req);
            return Box::pin(async move { fut.await });
        }

        let api_key_header = req
            .headers()
            .get("x-api-key")
            .and_then(|v| v.to_str().ok())
            .unwrap_or("")
            .to_string();

        if api_key_header.is_empty() || api_key_header != *self.api_key {
            warn!(
                "Unauthorized request to {}: missing or invalid API key",
                path
            );
            return Box::pin(async move {
                Err(actix_web::error::ErrorUnauthorized("Unauthorized"))?
            });
        }

        let fut = self.service.call(req);
        Box::pin(async move { fut.await })
    }
}
